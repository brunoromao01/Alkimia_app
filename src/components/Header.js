import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, Dimensions, TouchableWithoutFeedback, Modal, TouchableOpacity, Image } from 'react-native'
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";
import estilo from '../estilo'
import Feather from 'react-native-vector-icons/Feather'
import { RFValue } from 'react-native-responsive-fontsize'
import { Switch, TextInput } from 'react-native-paper'
import { v4 as uuid } from 'uuid'
import { getRealm } from '../services/realm'
import Settings from '../assets/tabIcon/settings.svg'
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

export default props => {

    const [modalVisible, setModalVisible] = useState(false)
    const [changeSwitch, setChangeSwitch] = useState(false)
    const [pgDefault, setPgDefault] = useState(0)
    const [vgDefault, setVgDefault] = useState(0)
    const [stepSlide, setStepSlide] = useState(0)
    const [breath, setBreath] = useState(0)
    const [months, setMonths] = useState(0)
    const [config, setConfig] = useState({})

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
        try {
            async function loadSchema() {
                const realm = await getRealm()
                const conf = realm.objects('Config')
                if (conf.length == 0) {
                    realm.write(() => {
                        const confi = realm.create('Config', {
                            _id: `${uuid()}`,
                            pgDefault: 1.04,
                            vgDefault: 1.26,
                            stepDefaul: 1
                        })
                        console.log(confi)
                    })
                }
                setConfig(conf)
                setPgDefault(conf[0].pgDefault)
                setVgDefault(conf[0].vgDefault)
                setStepSlide(conf[0].stepDefault)
                setBreath(conf[0].breathDefault)
                setMonths(conf[0].monthDefault)


                conf.addListener((values) => {
                    setConfig([...values])
                })

                return () => {
                    conf.removeAllListeners()
                }
            }
            loadSchema()
        } catch (error) {
            console.log(error)
        }
    }, [])

    const saveConfig = async () => {
        const realm = await getRealm()
        realm.write(() =>
            realm.create('Config', {
                _id: config[0]._id,
                pgDefault: Number(pgDefault),
                vgDefault: Number(vgDefault),
                stepDefault: Number(stepSlide),
                breathDefault: Number(breath),
                monthDefault: Number(months)
            }, 'modified')
        )
        setModalVisible(false)
    }

    return (
        <View style={styles.container}>
            <View style={{ width: '15%', }}></View>
            <View style={{ width: '70%', alignItems: 'center', justifyContent: 'center', }}>
                <Image source={require('../assets/tabIcon/logo2.png')} resizeMode='contain' style={{ width: '100%', height: RFValue(40) }} />
            </View>

            <View style={{ width: '15%', alignItems: 'flex-end', paddingRight: RFValue(10) }}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>

                    <Settings width={RFValue(23)} height={RFValue(23)} />

                </TouchableWithoutFeedback>
            </View>

            {/* Modal */}
            <Modal visible={modalVisible} onDismiss={() => setModalVisible(!modalVisible)} onRequestClose={() => setModalVisible(!modalVisible)} animationType="fade"
                transparent={true} >

                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                </TouchableWithoutFeedback>


                {/* Bloco central do modal */}
                <View flexDirection='row' >

                    {/* parte lateral do modal cadastro de essencia */}
                    <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />

                    {/*Modal cadastro de essencia */}
                    <View style={{ width: '94%', paddingTop: RFValue(20), height: '100%', borderWidth: 1, borderColor: estilo.colors.laranja, alignSelf: 'center', backgroundColor: 'white', paddingHorizontal: RFValue(10) }}>
                        <Text style={[styles.textCardEssence, { textAlign: 'center' }]}>Defina os valores padrão</Text>

                        <TextInput
                            style={styles.inputModal}
                            mode='outlined'
                            keyboardType='decimal-pad'
                            label="Peso PG (g)"
                            placeholder='Ex: 1.04'
                            placeholderTextColor={'#999'}
                            outlineColor={estilo.colors.azul}
                            activeOutlineColor={estilo.colors.laranja}
                            selectionColor='#ccc'
                            value={`${pgDefault}`}
                            maxLength={4}
                            onChangeText={pg => {
                                if (pg.includes(',')) {
                                    return
                                } else {
                                    setPgDefault(pg)
                                }
                            }}
                        />
                        <TextInput
                            style={styles.inputModal}
                            mode='outlined'
                            keyboardType='decimal-pad'
                            label="Peso VG (g)"
                            placeholder='Ex: 1.26'
                            placeholderTextColor={'#999'}
                            outlineColor={estilo.colors.azul}
                            activeOutlineColor={estilo.colors.laranja}
                            selectionColor='#ccc'
                            value={`${vgDefault}`}
                            maxLength={4}
                            onChangeText={vg => setVgDefault(vg)}
                        />
                        <TextInput
                            style={styles.inputModal}
                            mode='outlined'
                            keyboardType='decimal-pad'
                            label="Passo do slider"
                            placeholder='Ex: 5'
                            placeholderTextColor={'#999'}
                            outlineColor={estilo.colors.azul}
                            activeOutlineColor={estilo.colors.laranja}
                            selectionColor='#ccc'
                            maxLength={1}
                            value={`${stepSlide}`}
                            onChangeText={step => setStepSlide(step.replace(/\D/g, ''))}
                        />
                        <TextInput
                            style={styles.inputModal}
                            mode='outlined'
                            keyboardType='decimal-pad'
                            label="Dias de descanso"
                            placeholder='Ex: 14'
                            placeholderTextColor={'#999'}
                            outlineColor={estilo.colors.azul}
                            activeOutlineColor={estilo.colors.laranja}
                            selectionColor='#ccc'
                            value={`${breath}`}
                            maxLength={2}
                            onChangeText={breath => setBreath(breath.replace(/\D/g, ''))}
                        />
                        <TextInput
                            style={styles.inputModal}
                            mode='outlined'
                            keyboardType='decimal-pad'
                            label="Meses de vencimento"
                            placeholder='Ex: 4'
                            placeholderTextColor={'#999'}
                            outlineColor={estilo.colors.azul}
                            activeOutlineColor={estilo.colors.laranja}
                            selectionColor='#ccc'
                            maxLength={2}
                            value={`${months}`}
                            onChangeText={months => setMonths(months.replace(/\D/g, ''))}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                saveConfig()
                                showInterstitial()
                            }}
                        >
                            <View style={[styles.button, { marginTop: RFValue(50), marginBottom: RFValue(20) }]}>
                                <Text style={styles.buttonText}>Salvar configurações</Text>
                            </View>

                        </TouchableOpacity>


                    </View>
                    <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />

                </View>
                <TouchableWithoutFeedback onPress={() => {

                    setModalVisible(false)
                }}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').height * 0.08,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',

        backgroundColor: estilo.colors.azul,
        // marginBottom: 20,
        width: '100%'
    },
    title: {
        color: estilo.colors.laranja,
        fontSize: RFValue(35),
        fontFamily: 'fbsbltc'
    },
    inputModal: {
        width: '100%',
        alignSelf: 'center',
        borderRadius: RFValue(10),
        height: RFValue(50),
        fontSize: RFValue(15),
        backgroundColor: 'white',
        color: estilo.colors.azul,
        marginBottom: RFValue(10)

    },
    textCardEssence: {
        color: estilo.colors.azul,
        fontFamily: estilo.fonts.padrao,
        fontSize: RFValue(20),
        marginBottom: RFValue(15)
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
})