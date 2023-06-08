import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Image, TouchableWithoutFeedback, Modal, FlatList, ToastAndroid, ActivityIndicator } from 'react-native'
import { Root, Toast } from 'react-native-popup-confirm-toast'
import AwesomeAlert from 'react-native-awesome-alerts';
import { TextInput } from 'react-native-paper'
import { LogBox } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Header from '../components/Header'
import estilo from '../estilo'
import Slider from '@react-native-community/slider'
import CardRecipe from '../components/CardRecipe'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getRealm } from '../services/realm'
import Fontisto from 'react-native-vector-icons/Fontisto'
import { RFPercentage, RFValue } from "react-native-responsive-fontsize"
import { v4 as uuid } from 'uuid'
import InputRecipe from '../components/InputRecipe'
import SeparatorFlatlist from '../components/SeparatorFlatlist'
import { useRef } from 'react'
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// LogBox.ignoreLogs(['Warning: Encountered two children with the same key, ']);
LogBox.ignoreAllLogs();


const height = Dimensions.get('window').height

export default props => {
    const navigation = useNavigation()
    const [range, setRange] = useState(70) //slide vg pg
    const [essenceSelected, setEssenceSelected] = useState({})
    const [essences, setEssences] = useState({})
    // const [newVg, setnewVg] = useState({})
    const [newPg, setNewPg] = useState({})
    const [newVg, setNewVg] = useState({})
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [changeViewForInsert, setChangeViewForInsert] = useState(true);
    const [showModalProduce, setShowModalProduce] = useState(false);
    const [quantidade, setQuantidade] = useState();
    const [showButtonSaveRecipe, setShowButtonSaveRecipe] = useState(true);
    const [quantityPercentEmpty, setQuantityPercent] = useState(false);
    const [essenceEmpty, setEssenceEmpty] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [quantityEmpty, setQuantityEmpty] = useState(false);
    const [showAlertDuplicatedEssence, setShowAlertDuplicatedEssence] = useState(false);
    const [showModalNewQuantity, setShowModalNewQuantity] = useState(false);
    const [nameRecipe, setNameRecipe] = useState('');
    const [idRecipe, setIdRecipe] = useState(0);
    const [quantityRecipe, setQuantityRecipe] = useState(0);
    const [breath, setBreath] = useState(0);
    const [months, setMonths] = useState(0);
    const [newQuantityRecipe, setNewQuantityRecipe] = useState(0);
    const [recipeWillProduced, setRecipeWillProduced] = useState();
    const [vgSelected, setVgSelected] = useState();
    const [pgSelected, setPgSelected] = useState();

    const [quantityUsed, setQuantityUsed] = useState()
    const refNameRecipe = useRef()
    const refQuantityRecipe = useRef()

    const [step, setStep] = useState(0)
    const [showAlertPgOrVgEmpty, setShowAlertPgOrVgEmpty] = useState(false)
    const [showAlertEssenceWithoutStock, setShowAlertEssenceWithoutStock] = useState(false)




    const [recipes, setRecipes] = useState([]);
    const [essencesWithPercent, setEssencesWithPercent] = useState([]); //usado apenas para juntar essencias e percentuais para o inputrecipe
    const [essencesList, setEssencesList] = useState([]);
    const [percents, setPercents] = useState([]);
    const [quantityRegex, setQuantityRegex] = useState(0)
    const [quantityEssenceRegex, setQuantityEssenceRegex] = useState(0)
    const regex = /^\d*(\.\d+)?$/

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


    useFocusEffect(useCallback(() => {
        try {
            async function getEssences() {
                const realm = await getRealm()
                const config = realm.objects('Config')
                const s = config[0].stepDefault
                const b = config[0].breathDefault
                const m = config[0].monthDefault
                const ess = realm.objects('Essence')
                // const e = ess.filtered('isEssence == true')
                const e = ess.filtered('type == 1')
                setEssences(e)


                // const v = ess.filtered('isEssence == false')
                // setnewVg(e)
                const v = ess.filtered('type == 2')
                const p = ess.filtered('type == 3')
                setNewPg(p)
                setNewVg(v)

                const r = realm.objects('Recipe')
                setRecipes(r)
                setStep(s)
                setBreath(b)
                setMonths(m)

                e.addListener((values) => {
                    setEssences([...values])
                })
                r.addListener((values) => {
                    setRecipes([...values])
                })
                v.addListener((values) => {
                    setNewVg([...values])
                })
                p.addListener((values) => {
                    setNewPg([...values])
                })
                config.addListener((values) => {
                    setStep(values[0].stepDefault)
                    setBreath(values[0].breathDefault)
                    setMonths(values[0].monthDefault)
                })


                return () => {
                    e.removeAllListeners()
                    r.removeAllListeners()
                    v.removeAllListeners()
                    p.removeAllListeners()
                    config.removeAllListeners()
                }

            }
            getEssences()
        } catch (err) {
            console.log(err)
        }
    }, []))

    //adicionando esencia e percentual na listagem
    const insertEssence = async () => {
        var essenciaRepetida = false
        if (quantidade == undefined || quantidade == '') {
            setQuantityPercent(true)
        }
        if (!essenceSelected._id) {
            setEssenceEmpty(true)
        }
        if (quantidade > 0 && essenceSelected._id) {

            for (let index = 0; index < essencesWithPercent.length; index++) {
                if (essencesWithPercent[index].essencia._id == essenceSelected._id) {

                    setShowAlertDuplicatedEssence(true)

                    essenciaRepetida = true
                } else {
                    essenciaRepetida = false
                }

            }

            if (!essenciaRepetida) {
                setEssencesWithPercent(old => [...old, { essencia: essenceSelected, percent: Number(quantidade) }])
                setPercents(old => [...old, Number(quantidade)])
                setEssencesList(old => [...old, essenceSelected])
                setModalVisible(false)
                setEssenceSelected({})
                setQuantidade('')
                setShowButtonSaveRecipe(false)
            }
        }
    }

    //deletando essencia da listagem da receita
    const deletingItem = async (data, index) => {

        if (idRecipe != 0) {
            var essenceListFiltered2 = []
            var essencePercentFiltered2 = []
            for (let ind = 0; ind < essencesList.length; ind++) {
                if (ind != index) {
                    essenceListFiltered2.push(essencesList[ind])
                    essencePercentFiltered2.push(percents[ind])
                }
            }
            const realm = await getRealm()
            realm.write(() => {
                const r = realm.objectForPrimaryKey('Recipe', idRecipe)
                const modificado = realm.create('Recipe', {
                    _id: idRecipe,
                    name: r.name,
                    vg: r.vg,
                    pg: r.pg,
                    createdAt: r.createdAt,
                    essences: essenceListFiltered2,
                    percents: essencePercentFiltered2.splice(index, 1),
                    essencePg: pgSelected,
                    essenceVg: vgSelected
                }, 'modified')
            })
        }

        const essenceListFiltered = [...essencesList]
        const essencePercentFiltered = [...percents]

        const essencesFiltered = essencesWithPercent.filter(essence => essence != data)

        essenceListFiltered.splice(index, 1)
        essencePercentFiltered.splice(index, 1)

        setEssencesList(essenceListFiltered)
        setPercents(essencePercentFiltered)
        setEssencesWithPercent(essencesFiltered)
        if (essencesFiltered.length == 0) setShowButtonSaveRecipe(true)
    }

    // deleta marca
    async function deleteRecipe(item) {
        try {
            const realm = await getRealm()
            const recitasProduzidas = realm.objects('RecipeProduced')
            const receitaLocalizada = recitasProduzidas.filtered(`recipe._id == "${item._id}"`).length
            if (receitaLocalizada > 0) {

            } else {
                realm.write(() => {
                    realm.delete(item)
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    const editingRecipe = async ({ name, essences, percents, vg, _id, essenceVg, essencePg }) => {
        try {
            setEssencesWithPercent([])
            essences.map((essence, ind) => {
                setEssencesWithPercent(old => [...old, { essencia: essence, percent: percents[ind] }])
            })
            setPgSelected(essencePg)
            setVgSelected(essenceVg)
            setNameRecipe(name)
            setRange(vg)
            setEssencesList(essences)
            setPercents(percents)
            setShowButtonSaveRecipe(false)
            setChangeViewForInsert(true)
            setIdRecipe(_id)
        } catch (error) {
            console.log(error)
        }

    }

    const cloningRecipe = ({ name, essences, percents, vg, essenceVg, essencePg }) => {
        try {
            setEssencesWithPercent([])
            essences.map((essence, ind) => {
                setEssencesWithPercent(old => [...old, { essencia: essence, percent: percents[ind] }])
            })
            setPgSelected(essencePg)
            setVgSelected(essenceVg)
            setNameRecipe(name)
            setRange(vg)
            setEssencesList(essences)
            setPercents(percents)
            setShowButtonSaveRecipe(false)
            setChangeViewForInsert(true)
            setIdRecipe(0)
            showInterstitial()
        } catch (err) {
            console.log(err)
        }
    }


    //deletando receita das receitas cadastradas - é chamado pelo alert. Verifica se já não foi produzida
    const deletingRecipe = async data => {
        try {
            const realm = await getRealm()
            const recipeProduced = realm.objects('RecipeProduced')
            const recipe = realm.objectForPrimaryKey('Recipe', data._id)
            var receitalocalizada = 0

            recipeProduced.map(recipe => {
                if (recipe.recipe._id == data._id) {
                    receitalocalizada++
                }
            })

            if (receitalocalizada > 0) {
                showToast('Receita já produzida, não é possível excluí-la')
            } else {
                realm.write(() => {
                    realm.delete(recipe)
                })
                showInterstitial()
            }


        } catch (error) {
            console.log(error)
        }
    }

    const showToast = (message) => {
        ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
    }

    const producingRecipe = async data => {
        setShowModalProduce(true)

        setRecipeWillProduced(data)
    }

    //compara quantidade usada na receita com quantidade disponivel
    //caso quantidade disponivel seja menor, é recomendado a maior quantidade possivel
    const productionAnalysis = async () => {

        var percentualGeral = []
        const arrQuantidadeEstoque = []
        const arrQuantidadeUsada = []
        const arrQuantidadeUsadaRecomendada = []
        const arrDivergencia = []
        var cont = 0
        var pgQuantidadeUsada = 0
        //arrQuantidadeUsada = convertendo a porcentagem das essencias da receita em valor, baseado na quantidade da receita
        recipeWillProduced.percents.map((percent, ind) => {
            console.log(percent + recipeWillProduced.essences[ind])
            pgQuantidadeUsada += (percent * quantityRecipe) / 100
            arrQuantidadeUsada.push((percent * quantityRecipe) / 100)
        })
        //arrQuantidadeEstoque = quantidade no estoque de cada essência
        recipeWillProduced.essences.map(essencia => arrQuantidadeEstoque.push(essencia.quantity))


        arrQuantidadeUsada.push((recipeWillProduced.pg * quantityRecipe / 100) - pgQuantidadeUsada) //percentual em valor = pg
        arrQuantidadeUsada.push(Number(recipeWillProduced.vg * quantityRecipe / 100)) //percentual em valor = vg


        arrQuantidadeEstoque.push(recipeWillProduced.essencePg.quantity) //quantidade estoque pg    

        arrQuantidadeEstoque.push(recipeWillProduced.essenceVg.quantity) //quantidade estoque vg

        percentualGeral = [...recipeWillProduced.percents] //porcentagem apenas das essencias
        percentualGeral.push(recipeWillProduced.pg) //percentualGeral = acrescentando percentual de pg e vg na listagem
        percentualGeral.push(recipeWillProduced.vg)


        //Ex: percentualGeral = [essencia1%, essencia2%, essencia3%, ..., pg%, vg%]

        for (let index = 0; index < arrQuantidadeEstoque.length; index++) {
            if (arrQuantidadeUsada[index] <= arrQuantidadeEstoque[index]) {
                cont++ //contador para saber se todas as essencias estao com estoque ok
            } else {
                // array grava a quantidade maxima que poderia ser feito de cada essencia que ficou com falta
                arrDivergencia.push(arrQuantidadeEstoque[index] / (percentualGeral[index] / 100))
            }
        }

        if (cont < arrQuantidadeEstoque.length) {
            //Entrando aqui significa que a quantidade inserida é menor do que o possivel
            //minValue é o menor valor do arrDivergencia. Quantidade que será recomendada como maximo possivel para produção
            const minValue = arrDivergencia.reduce(function (prev, current) {
                return prev < current ? prev : current;
            });

            if (minValue == 0) {
                //Entrando aqui significa que a quantidade calculada é 0
                setShowAlertEssenceWithoutStock(true)
            } else {
                //Entrando aqui significa que a quantidade recomendada será usada
                setNewQuantityRecipe(minValue)

                setShowAlert(true)
                pgQuantidadeUsada = 0
                recipeWillProduced.percents.map(percent => {
                    pgQuantidadeUsada += (percent * minValue) / 100
                    arrQuantidadeUsadaRecomendada.push((percent * minValue) / 100)
                })
                arrQuantidadeUsadaRecomendada.push((recipeWillProduced.pg * minValue / 100) - pgQuantidadeUsada) //percentual em valor = pg
                arrQuantidadeUsadaRecomendada.push(Number(recipeWillProduced.vg * minValue / 100)) //percentual em valor = vg


                setQuantityUsed(arrQuantidadeUsadaRecomendada)


            }
        } else {
            if (quantityRecipe == 0) {
                //Entrando aqui significa que a quantidade informada é 0
                setShowAlertEssenceWithoutStock(true)
            } else {
                //Entrando aqui significa que a quantidade informada será usada

                saveRecipeProduced(quantityRecipe)
                updateQuantityEssences(arrQuantidadeUsada)
            }
        }

    }

    //desconta quantidade usada em cada ingrediente
    async function updateQuantityEssences(arrQuantidadeUsada) {
        setModalLoading(true)
        //arrPercentuais recebe todos os percentuais das essencias usadas = [essencia1%, essencia2%, ..., vg%, pg%]
        const arrEssencias = [...recipeWillProduced.essences]
        arrEssencias.push(recipeWillProduced.essencePg)
        arrEssencias.push(recipeWillProduced.essenceVg)
        //arrEssencias recebe {Essence} = [{essencia1}, {essencia2}, ..., {vg}, {pg}]
        const realm = await getRealm()
        for (let index = 0; index < arrEssencias.length; index++) {
            try {
                console.log(arrEssencias[index]._id)
                const essenciaLocalizada = realm.objectForPrimaryKey('Essence', `${arrEssencias[index]._id}`)
                realm.write(() => {
                    //buscando a essencia no banco pelo id, é descontado a quantidade usada na receita
                    essenciaLocalizada.quantity = essenciaLocalizada.quantity - (arrQuantidadeUsada[index])
                })
            } catch (error) {
                console.log('ERRO: ' + error)
            }
        }
        setModalLoading(false)

        showToast('Receita produzida com sucesso')
        setQuantityUsed([])
    }

    async function saveRecipeProduced(quantity) {
        const realm = await getRealm()
        const arrEssencesNames = []
        const arrEssencesBrandsName = []
        const arrEssencesPrices = []
        const arrEssencesQuantity = []
        for (var ess of recipeWillProduced.essences) {
            arrEssencesNames.push(ess.name)
            arrEssencesBrandsName.push(ess.brand.name)
            arrEssencesPrices.push(ess.price)
            arrEssencesQuantity.push(ess.quantity)
        }
        const arrPercents = [...recipeWillProduced.percents]
        const obj = {
            _id: recipeWillProduced._id,
            name: recipeWillProduced.name,
            vg: recipeWillProduced.vg,
            pg: recipeWillProduced.pg,
            essencePg: recipeWillProduced.essencePg,
            essenceVg: recipeWillProduced.essenceVg,
        }

        try {
            realm.write(() => {
                const recipeProduced = realm.create('RecipeProduced', {
                    _id: `${uuid()}`,
                    recipe: obj,
                    percents: arrPercents,
                    essencesNames: arrEssencesNames,
                    essencesBrandsName: arrEssencesBrandsName,
                    essencesPrices: arrEssencesPrices,
                    essencesQuantity: arrEssencesQuantity,
                    createdAt: new Date(),
                    months: Number(months),
                    breath: Number(breath),
                    rating: Number(0),
                    quantity: Number(quantity)
                })

            })
            setQuantityRecipe('')
            setRecipeWillProduced('')
        } catch (error) {
            console.log('ERRO: ' + error)
        }
    }




    async function saveNewRecipe() {
        const vg = Number(range)
        const pg = 100 - Number(range)
        const realm = await getRealm()
        var status = idRecipe == 0 ? 'never' : 'modified'
        var id = idRecipe == 0 ? `${uuid()}` : idRecipe
        try {

            realm.write(() => {
                realm.create('Recipe', {
                    _id: id,
                    name: nameRecipe,
                    vg: vg,
                    pg: pg,
                    createdAt: new Date(),
                    essences: essencesList,
                    percents: percents,
                    essencePg: pgSelected,
                    essenceVg: vgSelected
                }, status)
                setEssencesWithPercent([])
                setPercents([])
                setEssencesList([])
                setNameRecipe('')
                setShowButtonSaveRecipe(true)
                setVgSelected('')
                setPgSelected('')
            })
        } catch (error) {
            console.log('ERRO: ' + error)
        }
    }

    return (
        <>
            <View style={styles.container}>
                <Header />

                <View style={styles.body}>

                    <AwesomeAlert
                        show={showAlertEssenceWithoutStock}
                        showProgress={false}
                        title="Impossível produzir"
                        message={`Essa receita não pode ser produzida, algum dos ingredientes está com estoque zerado.`}
                        closeOnTouchOutside={false}
                        closeOnHardwareBackPress={false}
                        showCancelButton={false}
                        showConfirmButton={true}
                        cancelText="Cancelar."
                        confirmText="Ok, entendi."
                        confirmButtonColor={estilo.colors.laranja}
                        onCancelPressed={() => setShowAlertEssenceWithoutStock(false)}
                        onConfirmPressed={() => setShowAlertEssenceWithoutStock(false)}
                    />
                    <AwesomeAlert
                        show={showAlertPgOrVgEmpty}
                        showProgress={false}
                        title="Faltam dados importantes"
                        message={`VG ou PG não foram selecionados. Para criar uma nova receita, ambos devem ser informados.`}
                        closeOnTouchOutside={false}
                        closeOnHardwareBackPress={false}
                        showCancelButton={false}
                        showConfirmButton={true}
                        cancelText="Cancelar."
                        confirmText="Ok, entendi."
                        confirmButtonColor={estilo.colors.laranja}
                        onCancelPressed={() => setShowAlertPgOrVgEmpty(false)}
                        onConfirmPressed={() => setShowAlertPgOrVgEmpty(false)}
                    />
                    <AwesomeAlert
                        show={showAlertDuplicatedEssence}
                        showProgress={false}
                        title="Essência duplicada"
                        message={`A essência informada já foi adicionada. Escolha outra ou exclua essa essência e adicione novamente com a quantidade correta.`}
                        closeOnTouchOutside={false}
                        closeOnHardwareBackPress={false}
                        showCancelButton={false}
                        showConfirmButton={true}
                        cancelText="Cancelar."
                        confirmText="Ok, farei isso."
                        confirmButtonColor={estilo.colors.laranja}
                        onCancelPressed={() => setShowAlertDuplicatedEssence(false)}
                        onConfirmPressed={() => setShowAlertDuplicatedEssence(false)}
                    />

                    {/* Botao nova receita / receitas cadastradas */}
                    <View style={{ flexDirection: 'row', width: '100%', marginBottom: RFValue(30), paddingHorizontal: RFValue(20) }}>
                        <TouchableWithoutFeedback onPress={() => setChangeViewForInsert(true)}>
                            <View style={{ width: '50%', alignItems: 'center', borderBottomWidth: changeViewForInsert ? 3 : 1, borderColor: changeViewForInsert ? estilo.colors.azul : '#666' }}>
                                <Text style={[styles.buttonText, { fontFamily: estilo.fonts.padrao, color: changeViewForInsert ? estilo.colors.azul : '#666' }]}>
                                    Nova receita
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => setChangeViewForInsert(false)}>
                            <View style={{ width: '50%', alignItems: 'center', borderBottomWidth: changeViewForInsert ? 1 : 3, borderColor: changeViewForInsert ? '#666' : estilo.colors.azul }}>
                                <Text style={[styles.buttonText, { fontFamily: estilo.fonts.padrao, color: changeViewForInsert ? '#666' : estilo.colors.azul }]}>
                                    Receitas cadastradas
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>

                    {/* Modal Loading */}
                    <Modal visible={modalLoading} transparent >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
                            <ActivityIndicator size="large" color={estilo.colors.laranja} />
                        </View>
                    </Modal>

                    {/* modal de produção de receita */}
                    <Modal visible={showModalProduce} onDismiss={() => setShowModalProduce(!showModalProduce)} onRequestClose={() => setShowModalProduce(!showModalProduce)} animationType="fade"
                        transparent={true} >
                        <TouchableWithoutFeedback onPress={() => setShowModalProduce(false)}>
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                        </TouchableWithoutFeedback>


                        {/* Bloco central do modal */}
                        <View flexDirection='row' >

                            {/* parte lateral do modal cadastro de essencia */}
                            <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />

                            {/*Modal cadastro de essencia */}
                            <View style={{ width: '94%', padding: RFValue(20), height: '100%', borderWidth: 1, borderColor: estilo.colors.laranja, alignSelf: 'center', backgroundColor: 'white' }}>
                                <TextInput
                                    ref={refQuantityRecipe}
                                    style={styles.inputModal}
                                    mode='outlined'
                                    keyboardType='decimal-pad'
                                    label="*Quantidade (ml)"
                                    placeholder='Ex: 100'
                                    placeholderTextColor={'#999'}
                                    outlineColor={estilo.colors.azul}
                                    activeOutlineColor={estilo.colors.laranja}
                                    selectionColor='#ccc'
                                    value={quantityRecipe}
                                    onChangeText={q => {
                                        if (regex.test(q)) {
                                            setQuantityRecipe(q)
                                        } else {
                                            if (q.indexOf('.') > 0 && quantityRegex == 0) {
                                                setQuantityRecipe(q)
                                                setQuantityRegex(1)
                                            } else {
                                                return
                                            }
                                        }
                                        if (!q.includes('.')) setQuantityRegex(0)
                                        setQuantityEmpty(false)
                                        // setQuantityRecipe(q.replace(/\D/g, ''))
                                    }}
                                />
                                {quantityEmpty ? <Text style={{ color: '#999', width: '90%', alignSelf: 'center' }}>*Informe uma quantidade válida</Text> : false}

                                <TextInput
                                    style={styles.inputModal}
                                    mode='outlined'
                                    keyboardType='decimal-pad'
                                    label="Descanso (dias)"
                                    placeholder='Ex: 14'
                                    placeholderTextColor={'#999'}
                                    outlineColor={estilo.colors.azul}
                                    activeOutlineColor={estilo.colors.laranja}
                                    selectionColor='#ccc'
                                    maxLength={2}
                                    value={`${breath}`}
                                    onChangeText={d => setBreath(d.replace(/\D/g, ''))}
                                />
                                <TextInput
                                    style={styles.inputModal}
                                    mode='outlined'
                                    keyboardType='decimal-pad'
                                    label="Vencimento (meses)"
                                    placeholder='Ex: 6'
                                    placeholderTextColor={'#999'}
                                    outlineColor={estilo.colors.azul}
                                    activeOutlineColor={estilo.colors.laranja}
                                    selectionColor='#ccc'
                                    value={`${months}`}
                                    maxLength={2}
                                    onChangeText={m => setMonths(m.replace(/\D/g, ''))}
                                />

                                <TouchableOpacity
                                    onPress={() => {
                                        if (quantityRecipe == undefined || quantityRecipe == '' || quantityRecipe == 0) {

                                            setQuantityEmpty(true)
                                            refQuantityRecipe.current.focus();
                                        } else {

                                            setShowModalProduce(false)
                                            productionAnalysis()
                                        }
                                    }}
                                >
                                    <View style={styles.button}>
                                        <Text style={styles.buttonText}>Produzir receita</Text>
                                    </View>

                                </TouchableOpacity>
                            </View>
                            {/* parte lateral do modal*/}
                            <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />
                        </View>
                        {/* Bloco abaixo do modal */}
                        <TouchableWithoutFeedback onPress={() => setShowModalProduce(false)}>
                            <View style={{ flex: 1, backgroundColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.6)' }} />
                        </TouchableWithoutFeedback>
                    </Modal>

                    {
                        changeViewForInsert ?
                            // Nova receita
                            <View style={{ paddingHorizontal: RFValue(20), height: RFPercentage(60) }}>
                                <View style={{ alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between' }}>
                                        <Text style={styles.textSlider}>{range}</Text>
                                        <Text style={styles.textSlider}>{(range - 100) * -1}</Text>
                                    </View>
                                </View>
                                <Slider
                                    minimumValue={0}
                                    maximumValue={100}
                                    step={step}
                                    value={range}
                                    onValueChange={setRange}
                                    minimumTrackTintColor={estilo.colors.laranja}
                                    maximumTrackTintColor={estilo.colors.azul}
                                    thumbTintColor={estilo.colors.laranja}
                                />
                                <View style={{ alignItems: 'center', }}>
                                    <View style={{ flexDirection: 'row', width: '90%', justifyContent: 'space-between', height: RFValue(30) }}>
                                        <Text style={styles.textSlider}>VG</Text>
                                        <Text style={styles.textSlider}>PG</Text>
                                    </View>
                                </View>

                                <TextInput
                                    ref={refNameRecipe}
                                    style={styles.inputModal}
                                    mode='outlined'
                                    keyboardType='default'
                                    label="*Nome da mistura"
                                    placeholder='Ex: Unicorn Milk'
                                    placeholderTextColor={'#999'}
                                    outlineColor={estilo.colors.azul}
                                    activeOutlineColor={estilo.colors.laranja}
                                    selectionColor='#ccc'
                                    maxLength={20}
                                    value={nameRecipe}
                                    onChangeText={recipe => setNameRecipe(recipe)}
                                />

                                <View style={styles.viewButtonNew}>
                                    <TouchableOpacity onPress={() => {
                                        if (nameRecipe == undefined || nameRecipe == '') {
                                            refNameRecipe.current.focus();
                                        } else {
                                            setModalVisible(!modalVisible)
                                            setEssenceSelected({})
                                        }
                                    }}>
                                        <View style={{ justifyContent: 'space-around', flexDirection: 'row', paddingVertical: RFValue(7), backgroundColor: 'transparent', paddingHorizontal: RFValue(10), borderWidth: 2, borderColor: estilo.colors.laranja, borderRadius: 10, alignItems: 'center' }}>
                                            <FontAwesome name='plus' size={RFValue(14)} color={estilo.colors.laranja} />
                                            <Text style={{ marginLeft: RFValue(7), color: estilo.colors.laranja }}>Inserir essência</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <Modal visible={modalVisible} onDismiss={() => {
                                    setModalVisible(!modalVisible)
                                    setEssenceSelected({})
                                    setQuantityPercent(false)
                                    setEssenceEmpty(false)
                                }} onRequestClose={() => {
                                    setModalVisible(!modalVisible)
                                    setEssenceSelected({})
                                    setQuantityPercent(false)
                                    setEssenceEmpty(false)
                                }} animationType="fade"
                                    transparent={true} >
                                    {/* Bloco topo do modal */}
                                    <TouchableWithoutFeedback onPress={() => {
                                        setModalVisible(false)
                                        setEssenceSelected({})
                                        setQuantityPercent(false)
                                        setEssenceEmpty(false)
                                    }}>
                                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                    </TouchableWithoutFeedback>


                                    {/* Bloco central do modal */}
                                    <View flexDirection='row'>

                                        {/* parte lateral do modal*/}
                                        <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />

                                        {/*Modal inserir essencia na listagem da mistura */}
                                        <View style={{ width: '94%', paddingHorizontal: RFValue(10), paddingTop: RFValue(20), height: '100%', borderWidth: 1, borderColor: estilo.colors.laranja, alignSelf: 'center', backgroundColor: 'white' }}>
                                            <SelectDropdown
                                                data={essences}
                                                onSelect={(selectedItem, index) => {
                                                    setEssenceSelected(selectedItem)
                                                    setEssenceEmpty(false)
                                                    setQuantityPercent(false)
                                                    setEssenceEmpty(false)
                                                }}
                                                renderCustomizedButtonChild={(selectedItem, index) => {
                                                    return (
                                                        <View style={styles.viewDropDown}>
                                                            {/* <FontAwesome name="tags" color={estilo.colors.azul} size={RFValue(28)} /> */}
                                                            <Text style={styles.textDropDown}>{selectedItem ? selectedItem.name : '*Essência'}</Text>
                                                            <Text style={styles.textDropDown}>{selectedItem ? '-' : false}</Text>
                                                            <Text style={styles.textDropDown}>{selectedItem ? selectedItem.brand.name : false}</Text>
                                                        </View>
                                                    );
                                                }}
                                                renderCustomizedRowChild={(item, index) => {
                                                    return (
                                                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                            <Text style={styles.textDropDown}>{item.name}</Text>
                                                            <Text style={styles.textDropDown}> - </Text>
                                                            <Text style={styles.textDropDown}>{item.brand.name}</Text>
                                                        </View>
                                                    );
                                                }}
                                                search
                                                // searchInputStyle={styles.dropdown3searchInputStyleStyle}
                                                searchPlaceHolder={'Pesquisa por essência ou marca'}
                                                searchPlaceHolderColor={'#aaa'}
                                                renderSearchInputLeftIcon={() => {
                                                    return <FontAwesome name={'search'} color={'#aaa'} size={18} />;
                                                }}
                                                buttonTextAfterSelection={selectedItem => selectedItem.name}
                                                rowTextForSelection={item => item}
                                                buttonTextStyle={{ color: estilo.colors.azul, textAlign: 'left', fontSize: RFValue(15) }}
                                                buttonStyle={{ borderWidth: 1, borderColor: estilo.colors.azul, width: '100%', backgroundColor: 'white', marginVertical: RFValue(5), borderRadius: RFValue(5), height: RFValue(50) }}
                                                defaultButtonText={'*Essência'}
                                                dropdownStyle={{ backgroundColor: 'white' }}
                                                renderDropdownIcon={() => <Fontisto name='angle-down' size={RFValue(16)} color={estilo.colors.azul} />}
                                                rowTextStyle={{ backgroundColor: 'white', fontSize: RFValue(15) }}
                                                rowStyle={{ backgroundColor: 'white' }}
                                                dropdownIconPosition='right'
                                            />
                                            {essenceEmpty ? <Text style={{ color: '#999' }}>*Informe uma essência</Text> : false}
                                            <TextInput
                                                // ref={refQuantidadePorcentagem}
                                                style={styles.inputModal}
                                                mode='outlined'
                                                keyboardType='decimal-pad'
                                                label="*Quantidade (%)"
                                                placeholder='Ex: 5'
                                                placeholderTextColor={'#999'}
                                                outlineColor={estilo.colors.azul}
                                                activeOutlineColor={estilo.colors.laranja}
                                                selectionColor='#ccc'
                                                value={quantidade}
                                                maxLength={5}
                                                onChangeText={q => {
                                                    if (regex.test(q)) {
                                                        setQuantidade(q)
                                                    } else {
                                                        if (q.indexOf('.') > 0 && quantityEssenceRegex == 0) {
                                                            setQuantidade(q)
                                                            setQuantityEssenceRegex(1)
                                                        } else {
                                                            return
                                                        }
                                                    }
                                                    if (!q.includes('.')) setQuantityEssenceRegex(0)
                                                }}
                                            />
                                            {quantityPercentEmpty && !quantidade ? <Text style={{ color: '#999' }}>*Digite a quantidade</Text> : false}
                                            <TouchableOpacity
                                                onPress={() => insertEssence()}
                                            >
                                                <View style={[styles.button, { marginTop: RFValue(50), marginBottom: RFValue(20) }]}>
                                                    <Text style={styles.buttonText}>Salvar essência</Text>
                                                </View>

                                            </TouchableOpacity>

                                        </View>

                                        {/* parte lateral do modal*/}
                                        <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                    </View>
                                    {/* Bloco abaixo do modal */}
                                    <TouchableWithoutFeedback onPress={() => {
                                        setModalVisible(false)
                                        setEssenceSelected({})
                                        setQuantidade()
                                        setQuantityPercent(false)
                                        setEssenceEmpty(false)
                                    }}>
                                        <View style={{ flex: 1, backgroundColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                    </TouchableWithoutFeedback>
                                </Modal>
                                <View style={{ height: height * 0.4 }}>
                                    <FlatList
                                        data={essencesWithPercent}
                                        keyExtractor={item => item.essencia._id}

                                        ListHeaderComponent={() => {
                                            var percentTotal = 0
                                            percents.map(percent => percentTotal += percent)
                                            var pgTotal = 100 - range - percentTotal

                                            return (
                                                <>
                                                    <View flexDirection='row' style={[styles.cardEssence, { padding: RFValue(5) }]}>
                                                        <View style={{ width: '20%', paddingLeft: RFValue(10), justifyContent: 'center' }}>
                                                            <Text style={styles.textCardEssence}>VG</Text>
                                                        </View>
                                                        <View style={{ width: '50%' }}>
                                                            <SelectDropdown
                                                                data={newVg}
                                                                onSelect={(selectedItem, index) => {
                                                                    setVgSelected(selectedItem)
                                                                }}
                                                                renderCustomizedButtonChild={(selectedItem, index) => {
                                                                    var textVg = ''
                                                                    if (selectedItem) {
                                                                        textVg = `${selectedItem.name} - ${selectedItem.brand.name}`
                                                                    } else if (vgSelected) {
                                                                        textVg = `${vgSelected.name} - ${vgSelected.brand.name}`
                                                                    } else {
                                                                        textVg = '*Selecione o VG'
                                                                    }
                                                                    return (
                                                                        <View style={styles.ingredienteDropdown}>
                                                                            <Text style={styles.textDropDown}>{textVg}</Text>
                                                                        </View>
                                                                    )

                                                                }}

                                                                renderCustomizedRowChild={(item, index) => {
                                                                    return (
                                                                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Text style={styles.textDropDown}>{item.name} - {item.brand.name}</Text>
                                                                        </View>
                                                                    );
                                                                }}
                                                                buttonTextAfterSelection={selectedItem => selectedItem.name}
                                                                rowTextForSelection={item => item}
                                                                buttonTextStyle={{ color: estilo.colors.azul, textAlign: 'left', fontSize: RFValue(12) }}
                                                                buttonStyle={{ alignItems: 'center', borderWidth: 1, borderColor: estilo.colors.azul, width: '100%', backgroundColor: 'white', borderRadius: RFValue(5), height: RFValue(25) }}
                                                                defaultButtonText={'*Essência'}
                                                                dropdownStyle={{ backgroundColor: 'white' }}
                                                                renderDropdownIcon={() => <Fontisto name='angle-down' size={RFValue(12)} color={estilo.colors.azul} />}
                                                                rowTextStyle={{ backgroundColor: 'white', fontSize: RFValue(15) }}
                                                                rowStyle={{ backgroundColor: 'white' }}
                                                                dropdownIconPosition='right'
                                                            />
                                                        </View>
                                                        <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={styles.textCardEssence}>{range.toFixed(2)}%</Text>
                                                        </View>
                                                        <View style={{ width: '10%', alignItems: 'flex-end' }}>
                                                        </View>
                                                    </View>
                                                    <SeparatorFlatlist />
                                                    <View flexDirection='row' style={[styles.cardEssence, { padding: RFValue(5) }]}>
                                                        <View style={{ width: '20%', paddingLeft: RFValue(10), justifyContent: 'center' }}>
                                                            <Text style={styles.textCardEssence}>PG</Text>
                                                        </View>
                                                        <View style={{ width: '50%' }}>
                                                            <SelectDropdown
                                                                data={newPg}
                                                                onSelect={(selectedItem, index) => {
                                                                    setPgSelected(selectedItem)
                                                                }}
                                                                renderCustomizedButtonChild={(selectedItem, index) => {
                                                                    var textPg = ''
                                                                    if (selectedItem) {
                                                                        textPg = `${selectedItem.name} - ${selectedItem.brand.name}`
                                                                    } else if (pgSelected) {
                                                                        textPg = `${pgSelected.name} - ${pgSelected.brand.name}`
                                                                    } else {
                                                                        textPg = '*Selecione o PG'
                                                                    }
                                                                    return (
                                                                        <View style={styles.ingredienteDropdown}>
                                                                            <Text style={styles.textDropDown}>{textPg}</Text>
                                                                        </View>
                                                                    )
                                                                }}
                                                                renderCustomizedRowChild={(item, index) => {
                                                                    return (
                                                                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                                            <Text style={styles.textDropDown}>{item.name} - {item.brand.name}</Text>
                                                                        </View>
                                                                    );
                                                                }}
                                                                buttonTextAfterSelection={selectedItem => selectedItem.name}
                                                                rowTextForSelection={item => item}
                                                                buttonTextStyle={{ color: estilo.colors.azul, textAlign: 'left', fontSize: RFValue(12) }}
                                                                buttonStyle={{ alignItems: 'center', borderWidth: 1, borderColor: estilo.colors.azul, width: '100%', backgroundColor: 'white', borderRadius: RFValue(5), height: RFValue(25) }}
                                                                defaultButtonText={'*Essência'}
                                                                dropdownStyle={{ backgroundColor: 'white' }}
                                                                renderDropdownIcon={() => <Fontisto name='angle-down' size={RFValue(12)} color={estilo.colors.azul} />}
                                                                rowTextStyle={{ backgroundColor: 'white', fontSize: RFValue(15) }}
                                                                rowStyle={{ backgroundColor: 'white' }}
                                                                dropdownIconPosition='right'
                                                            />
                                                        </View>
                                                        <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={styles.textCardEssence}>{pgTotal.toFixed(2)}%</Text>
                                                        </View>
                                                        <View style={{ width: '10%', alignItems: 'flex-end' }} />
                                                    </View>
                                                    <SeparatorFlatlist />
                                                </>
                                            )
                                        }}
                                        renderItem={({ item, index }) => <InputRecipe data={item} deletion={deletingItem} index={index} />}
                                        ItemSeparatorComponent={<SeparatorFlatlist />}
                                    >
                                    </FlatList>
                                    {
                                        showButtonSaveRecipe ?
                                            false :
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (vgSelected == undefined || vgSelected == '' || pgSelected == undefined || pgSelected == '') {
                                                            setShowAlertPgOrVgEmpty(true)
                                                        } else {
                                                            saveNewRecipe()
                                                        }
                                                    }}
                                                >
                                                    <View style={[styles.button]}>
                                                        <Text style={styles.buttonText}>Salvar receita</Text>
                                                    </View>

                                                </TouchableOpacity>
                                                {/* <View style={{height: RFValue(70), backgroundColor: 'blue'}}></View> */}
                                            </>
                                    }

                                </View>

                            </View>


                            : <View style={{ paddingBottom: RFValue(100) }}>
                                {/* receitas cadastradas */}
                                <AwesomeAlert
                                    show={showAlert}
                                    showProgress={false}
                                    title="Ops, quantidade incompatível"
                                    message={`Alguma essência não tem estoque suficiente. O máximo que pode ser produzido é ${newQuantityRecipe.toFixed(2)}ml. Deseja fazer essa nova quantidade ? `}
                                    closeOnTouchOutside={false}
                                    closeOnHardwareBackPress={false}
                                    showCancelButton={true}
                                    showConfirmButton={true}
                                    cancelText="Cancelar."
                                    confirmText="Sim, eu quero."
                                    confirmButtonColor={estilo.colors.laranja}
                                    onCancelPressed={() => setShowAlert(false)}
                                    onConfirmPressed={() => {
                                        setShowAlert(false)
                                        saveRecipeProduced(newQuantityRecipe)
                                        updateQuantityEssences(quantityUsed)
                                    }}
                                />
                                <Modal visible={showModalNewQuantity} onDismiss={() => setShowModalNewQuantity(!showModalNewQuantity)} onRequestClose={() => setShowModalNewQuantity(!showModalNewQuantity)} animationType="fade"
                                    transparent={true} >
                                    <TouchableWithoutFeedback onPress={() => setShowModalNewQuantity(false)}>
                                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                    </TouchableWithoutFeedback>
                                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderRadius: RFValue(10) }}>
                                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                        <View style={{ flex: 10, height: '70%' }}>
                                            <View style={{ alignItems: 'center', marginBottom: RFValue(10), marginTop: RFValue(25) }}>
                                                <Text style={{ fontSize: RFValue(20), fontFamily: estilo.fonts.negrito, color: estilo.colors.azul }}>Ops, quantidade incompatível</Text>
                                            </View>
                                            <View style={{ alignItems: 'center', marginBottom: RFValue(20), paddingHorizontal: RFValue(10) }}>
                                                <Text style={[styles.textCardEssence, { textAlign: 'center' }]}>
                                                    {`Alguma essência não tem estoque suficiente. O máximo que pode ser produzido é ${newQuantityRecipe.toFixed(2)}ml. Deseja fazer essa nova quantidade ? `}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: RFValue(25) }}>

                                                <TouchableOpacity onPress={() => setShowModalNewQuantity(false)}>
                                                    <View style={{ height: RFValue(40), width: RFValue(150), backgroundColor: '#ccc', borderRadius: RFValue(10), alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={[styles.buttonText, { color: 'white' }]}>Cancelar</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setShowModalNewQuantity(false)
                                                        saveRecipeProduced(newQuantityRecipe)
                                                        updateQuantityEssences(quantityUsed)
                                                    }}
                                                >
                                                    <View style={{ height: RFValue(40), width: RFValue(150), backgroundColor: estilo.colors.laranja, borderRadius: RFValue(10), alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={[styles.buttonText, { color: 'white' }]}>Sim, eu quero</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />



                                    </View>
                                    {/* Bloco abaixo do modal */}
                                    <TouchableWithoutFeedback onPress={() => setShowModalNewQuantity(false)}>
                                        <View style={{ flex: 1, backgroundColor: 'transparent', backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                    </TouchableWithoutFeedback>
                                </Modal>

                                {/* recipes = 0 mostra imagem do empty e botao. Caso contrario flatlist cardrecipe */}
                                {
                                    recipes.length < 1 ?
                                        <View style={{ justifyContent: 'flex-start' }}>
                                            <Image source={require('../assets/background/empty.jpg')} resizeMode='contain' style={{ width: '100%', height: RFValue(250), justifyContent: "flex-start" }} />
                                            <TouchableOpacity
                                                onPress={() => setChangeViewForInsert(true)}
                                            >
                                                <View style={[styles.button, { width: '90%' }]}>
                                                    <Text style={styles.buttonText}>Cadastrar nova Receita</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        :
                                        <FlatList
                                            data={recipes}
                                            keyExtractor={item => item._id}
                                            renderItem={({ item }) => <CardRecipe data={item} deletingRecipe={deletingRecipe} cloningRecipe={cloningRecipe} producingRecipe={producingRecipe} editingRecipe={editingRecipe} />}
                                            ItemSeparatorComponent={<SeparatorFlatlist />}
                                        />
                                }
                            </View>
                    }
                </View >
                <View style={{ flex: 1, backgroundColor: 'white' }} />
            </View >

        </>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 9,
    },
    body: {
        borderRadius: RFValue(10),
        height: height * 0.79,
        width: '100%',
        paddingTop: RFValue(20),
        alignSelf: 'center',
        backgroundColor: 'white',
    },
    textSlider: {
        fontSize: RFValue(12),
        color: estilo.colors.azul,
        textAlign: 'center',
        fontFamily: estilo.fonts.padrao
    },
    input: {
        marginBottom: RFValue(5),
        backgroundColor: 'white',
        fontSize: RFValue(18),
        height: RFValue(50),
        borderRadius: RFValue(5)

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
    buttonText: {
        color: estilo.colors.azul,
        fontSize: RFValue(16),
        fontFamily: estilo.fonts.negrito,

    },
    fields: {
        width: '100%',
        backgroundColor: estilo.colors.cinza,
        padding: RFValue(10),
        marginTop: RFValue(15)
    },
    tableTitle: {
        fontFamily: estilo.fonts.negrito,
        fontSize: RFValue(20),
        color: estilo.colors.cinza
    },
    textIng: {
        fontFamily: estilo.fonts.padrao,
        fontSize: RFValue(15),
        color: estilo.colors.cinza,
    },
    viewRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: estilo.colors.cinza,
        marginBottom: RFValue(5)
    },
    viewCellSmaller: {
        width: '14%',
        alignItems: 'center'
    },
    viewCellBigger: {
        width: '45%',
        alignItems: 'flex-start'
    },
    viewDropDown: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',

    },
    textDropDown: {
        marginLeft: RFValue(10),
        color: estilo.colors.azul,
        fontSize: RFValue(15)
    },
    viewButtonNew: {
        alignSelf: 'flex-end',
        // marginRight: RFValue(10),
        marginBottom: RFValue(5),
        justifyContent: 'flex-start',
        marginTop: RFValue(20),
    },
    inputModal: {
        width: '100%',
        alignSelf: 'center',
        borderRadius: RFValue(10),
        height: RFValue(50),
        fontSize: RFValue(15),
        backgroundColor: 'white',
        color: estilo.colors.azul
    },
    dropdown3searchInputStyleStyle: {
        backgroundColor: 'slategray',
        borderBottomWidth: 1,
        borderBottomColor: '#FFF',
    },
    textCardEssence: {
        color: estilo.colors.azul,
        fontFamily: estilo.fonts.padrao,
        fontSize: RFValue(15)
    },
    cardEssence: {
        width: '100%',
        backgroundColor: estilo.colors.cinza,

        padding: RFValue(10),
        elevation: 1,
    },

})