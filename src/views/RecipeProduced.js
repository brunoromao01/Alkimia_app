import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableWithoutFeedback, FlatList, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native'
import { VictoryAxis, VictoryChart, VictoryTheme, VictoryBar, VictoryLabel, VictoryLegend } from "victory-native";
import Header from '../components/Header'
import { getRealm } from '../services/realm'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import estilo from '../estilo'
import { RFValue } from "react-native-responsive-fontsize"
import SeparatorFlatList from '../components/SeparatorFlatlist'
import CardRecipeProduced from '../components/CardRecipeProduced'
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

export default props => {
    const navigation = useNavigation()
    var receitas = []
    const [recipesProduced, setRecipesProduced] = useState([])
    const [receitasSlice, setReceitasSlice] = useState([])
    const [changeChartsOrHistoric, setChangeChartsOrHistoric] = useState(true)
    const [showAllRecipes, setShowAllRecipes] = useState(true)
    const [total, setTotal] = useState([])
    const [custo, setCustoTotal] = useState([])

    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-2891228130686358~2377999058';

    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['fashion', 'clothing']
    })

    const showInterstitial = () => {
        console.log('effect interstitial')
        const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            interstitial.show()
        })
        interstitial.load()
        return unsubscribe
    }

    useEffect(() => {
        if (!showAllRecipes && recipesProduced.length > 10) {
            console.log('slice')
            receitas = recipesProduced.slice(recipesProduced.length - 10)
        } else {
            receitas = recipesProduced
        }
        console.log(receitas.length)
        setReceitasSlice(receitas)


    }, [showAllRecipes])

    useFocusEffect(useCallback(() => {
        async function getRecipes() {
            const realm = await getRealm()
            const r = realm.objects('RecipeProduced')
            setRecipesProduced(r)
            setReceitasSlice(r)
            r.addListener((values) => {
                setRecipesProduced([...values])
            })
            var recipeProduced = [...r]

            var essenciaqtde = []
            var custoTotal = []
            var soma = 0
            for (let index = 0; index < recipeProduced.length; index++) {
                custoReceita = []
                var percentPg = 0
                soma = 0

                for (let ind = 0; ind < recipeProduced[index].percents.length; ind++) {
                    essenciaqtde.push({ name: recipeProduced[index].essencesNames[ind], qtde: recipeProduced[index].percents[ind] * recipeProduced[index].quantity / 100 })
                    soma += (recipeProduced[index].percents[ind] * recipeProduced[index].quantity / 100) * recipeProduced[index].essencesPrices[ind]
                    percentPg += recipeProduced[index].percents[ind]
                }
                soma += recipeProduced[index].recipe.essenceVg.price * (recipeProduced[index].recipe.vg * recipeProduced[index].quantity / 100)
                soma += recipeProduced[index].recipe.essencePg.price * ((recipeProduced[index].recipe.pg - percentPg) * recipeProduced[index].quantity / 100)
                custoTotal.push({ custo: (soma / recipeProduced[index].quantity).toFixed(2), nome: recipeProduced[index].recipe.name })
            }


            custoTotal.sort(function (a, b) {
                if (a.custo > b.custo) {
                    return 1;
                }
                if (a.custo < b.custo) {
                    return -1;
                }

                return 0;
            });

            setCustoTotal(custoTotal)
            setShowAllRecipes(!showAllRecipes)

            //grafico essencias mais consumidas
            var namess = []
            var essenciatotal = []
            var names1 = []

            for (let i = 0; i < essenciaqtde.length; i++) {
                namess.push(essenciaqtde[i].name)
            }
            names1 = [...new Set(namess)]

            for (let e = 0; e < names1.length; e++) {
                var soma = 0
                for (let i = 0; i < essenciaqtde.length; i++) {

                    if (names1[e] == essenciaqtde[i].name) {
                        soma += essenciaqtde[i].qtde
                    }
                }
                essenciatotal.push({ name: names1[e], qtde: soma })
            }
            essenciatotal.sort(function (a, b) {
                if (a.qtde < b.qtde) {
                    return 1;
                }
                if (a.qtde > b.qtde) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });
            setTotal(essenciatotal.slice(0, 10))
            return () => {
                r.removeAllListeners()
            }
        }
        getRecipes()
    }, []))



    const saveRating = async (id, star) => {
        const realm = await getRealm()
        const r = realm.objectForPrimaryKey('RecipeProduced', id)
        realm.write(() => {
            r.rating = star
        })
    }


    return (
        <>
            <Header />
            <View style={styles.container}>

                {/* botao historico - graficos */}
                <View style={{ flexDirection: 'row', width: '100%', marginVertical: RFValue(20), paddingHorizontal: RFValue(20) }}>

                    <TouchableWithoutFeedback onPress={() => setChangeChartsOrHistoric(true)}>
                        <View style={{ width: '50%', alignItems: 'center', borderBottomWidth: changeChartsOrHistoric ? 3 : 1, borderColor: changeChartsOrHistoric ? estilo.colors.azul : '#666' }}>
                            <Text style={[styles.buttonText, { fontFamily: estilo.fonts.padrao, color: changeChartsOrHistoric ? estilo.colors.azul : '#666' }]}>
                                Histórico
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={() => setChangeChartsOrHistoric(false)}>
                        <View style={{ width: '50%', alignItems: 'center', borderBottomWidth: changeChartsOrHistoric ? 1 : 3, borderColor: changeChartsOrHistoric ? '#666' : estilo.colors.azul }}>
                            <Text style={[styles.buttonText, { fontFamily: estilo.fonts.padrao, color: changeChartsOrHistoric ? '#666' : estilo.colors.azul }]}>
                                Gráficos
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>

                </View>

                {
                    recipesProduced.length < 1 ?


                        < View style={{ width: '100%', height: '100%' }}>
                            <Image source={require('../assets/background/empty.jpg')} resizeMode='contain' style={{ width: '100%', height: RFValue(250), justifyContent: "flex-start" }} />

                            <TouchableOpacity
                                onPress={() => {
                                    console.log('press')
                                    navigation.navigate('Recipe')
                                }}
                            >
                                <View style={[styles.button, { width: '90%' }]}>
                                    <Text style={styles.buttonText}>Produzir receita</Text>
                                </View>
                            </TouchableOpacity>
                        </View>



                        : false
                }

                {
                    changeChartsOrHistoric ?
                        <View style={{ height: '100%', paddingBottom: Dimensions.get('window').height * 0.2 }}>
                            <View style={{ height: RFValue(20), flexDirection: 'row', justifyContent: 'flex-end', marginRight: RFValue(5) }}>
                                {
                                    showAllRecipes ?
                                        <TouchableWithoutFeedback onPress={() => setShowAllRecipes(!showAllRecipes)}>
                                            <Text style={styles.textShow}>Mostrar últimas 10</Text>
                                        </TouchableWithoutFeedback> :
                                        <TouchableWithoutFeedback onPress={() => {
                                            showInterstitial()
                                            setShowAllRecipes(!showAllRecipes)
                                        }}>
                                            <Text style={styles.textShow}>Mostrar tudo</Text>
                                        </TouchableWithoutFeedback>
                                }
                            </View>

                            <View style={{ flex: 1 }}>
                                <FlatList
                                    data={receitasSlice}
                                    keyExtractor={item => item._id}
                                    ItemSeparatorComponent={<SeparatorFlatList />}
                                    renderItem={({ item }) => <CardRecipeProduced data={item} saveRating={saveRating} />}

                                />
                            </View>


                        </View>
                        :
                        <>
                            <ScrollView>
                                {total.length > 0 ?
                                    <>
                                        <View >

                                            <View>
                                                <VictoryChart
                                                    domainPadding={15}                                                   
                                                >
                                                    <VictoryBar
                                                        // data={total.filter(essencia => essencia.qtde >= 30)}
                                                        data={total.sort()}
                                                        x='name' y='qtde'
                                                        alignment="middle"
                                                        labels={({ datum }) => `${Number(datum._y).toFixed(1)}`}
                                                        sortOrder="descending"
                                                        style={{ data: { fill: estilo.colors.laranja, fontSize: RFValue(8) } }}
                                                    />
                                                    <VictoryAxis
                                                        tickFormat={total.name}
                                                        tickLabelComponent={<VictoryLabel angle={30} textAnchor="start" style={{ fontSize: RFValue(8) }} />}
                                                    />
                                                    {/* <VictoryAxis
                                            dependentAxis
                                            tickFormat={(x) => (`${x}ml`)}
                                        /> */}

                                                </VictoryChart>
                                            </View>
                                            <Text style={styles.textCardEssence}>Essências mais consumidas</Text>
                                        </View>
                                    </>
                                    : false
                                }
                                <View style={{ width: '95%', alignSelf: 'center', borderWidth: 1, borderColor: estilo.colors.azul, marginTop: RFValue(20) }} />
                                {custo.length > 0 ?
                                    <>
                                        <View >

                                            <View style={{ paddingLeft: RFValue(10) }}>
                                                <VictoryChart
                                                // theme={VictoryTheme.material}
                                                // domainPadding={25}
                                                >
                                                    <VictoryBar
                                                        horizontal
                                                        // data={custo.filter(essencia => essencia.qtde >= 30)}
                                                        data={custo.sort()}
                                                        x='nome' y='custo'
                                                        alignment="middle"
                                                        labels={({ datum }) => `${Number(datum.custo).toFixed(2)}`}
                                                        style={{ data: { fill: estilo.colors.laranja } }}
                                                        sortOrder="descending"
                                                    />
                                                    <VictoryAxis
                                                        tickFormat={total.name}
                                                        tickLabelComponent={<VictoryLabel angle={-30} textAnchor="middle" style={{ fontSize: RFValue(7) }} />}
                                                    />
                                                    {/* <VictoryAxis
                                                        dependentAxis
                                                        tickFormat={(x) => (`${x}`)}
                                                    /> */}

                                                </VictoryChart>
                                            </View>
                                            <Text style={styles.textCardEssence}>Receitas por custo/ml</Text>
                                        </View>
                                        <View style={{ width: '95%', alignSelf: 'center', borderWidth: 1, borderColor: estilo.colors.azul, marginTop: RFValue(20) }} />
                                    </>
                                    : false
                                }


                            </ScrollView>
                            <View style={{ height: RFValue(80) }}></View>
                        </>
                }


            </View >
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    buttonText: {
        color: estilo.colors.azul,
        fontSize: RFValue(16),
        fontFamily: estilo.fonts.negrito,

    },
    cardEssence: {
        width: '100%',
        backgroundColor: estilo.colors.cinza,

        padding: RFValue(10),
        elevation: 1,
    },
    textCardRecipe: {
        color: estilo.colors.azul,
        backgroundColor: estilo.colors.cinza,
        fontSize: RFValue(20),
        fontFamily: estilo.fonts.padrao
    },
    textCardEssence: {
        color: estilo.colors.azul,
        fontFamily: estilo.fonts.negrito,
        textAlign: 'center',
        marginTop: RFValue(10)
    },
    textCardRecipeBottom: {
        color: estilo.colors.azul,
        backgroundColor: estilo.colors.cinza,
        fontSize: RFValue(15),
        fontFamily: estilo.fonts.padrao
    },
    button: {
        backgroundColor: estilo.colors.laranja,
        width: '100%',
        height: Dimensions.get('window').height / 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: RFValue(25),
        borderRadius: RFValue(5),
        alignSelf: 'center',


    },
    textShow: {
        color: estilo.colors.azul,
        fontFamily: estilo.fonts.padrao,


    },

})