import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableWithoutFeedback, Modal, Dimensions, TouchableOpacity, FlatList, Button, Switch, Image } from 'react-native'
import { TextInput } from 'react-native-paper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { getRealm } from '../services/realm'
import { v4 as uuid } from 'uuid'
import estilo from '../estilo'
import Header from '../components/Header'
import { RFValue } from "react-native-responsive-fontsize"
import CardEssence from '../components/CardEssence'
import SeparatorFlatlist from '../components/SeparatorFlatlist'
import AwesomeAlert from 'react-native-awesome-alerts';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';



export default props => {
    const regex = /^\d*(\.\d+)?$/
    const [modalVisible, setModalVisible] = useState(false);
    const [modalBrand, setModalBrand] = useState(false);
    const [modalSuplier, setModalSuplier] = useState(false);
    const [search, setSearch] = useState("")
    const [isEssence, setIsEssence] = useState(true)
    const [showAlertBrandUsed, setShowAlertBrandUsed] = useState(false)
    const [showAlertSuplierUsed, setShowAlertSuplierUsed] = useState(false)
    const [isEdit, setIsEdit] = useState(false)

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




    //marca e fornecedor são os label dos input
    const [marca, setMarca] = useState("*Marca")
    const [fornecedor, setFornecedor] = useState("Fornecedor")

    //brands, essences e supliers recebem os dados do banco
    const [brands, setBrands] = useState([])
    const [essences, setEssences] = useState([])
    const [supliers, setSupliers] = useState([])

    const [newBrand, setNewBrand] = useState('') //onchangetext
    const [newBrandFull, setNewBrandFull] = useState({}) //recebe objeto marca para salvar na essencia (banco)
    const [newSuplier, setNewSuplier] = useState('') //onchangetext
    const [newSuplierFull, setNewSuplierFull] = useState({}) //recebe objeto fornecedor para salvar na essencia (banco)
    const [idUpdated, setIdUpdated] = useState(0) //usado para saber se executa update ou save
    const [newName, setNewName] = useState('')
    const [newQuantity, setNewQuantity] = useState('')
    const [newPrice, setNewPrice] = useState('')
    const [newTaste, setNewTaste] = useState('')
    const [priceRegex, setPriceRegex] = useState(0)
    const [quantityRegex, setQuantityRegex] = useState(0)

    //alerta campos obrigatorios vazios

    const [nameEmpty, setNameEmpty] = useState(false)
    const [brandEmpty, setBrandEmpty] = useState(false)
    const [quantityEmpty, setQuantityEmpty] = useState(false)
    const [priceEmpty, setPriceEmpty] = useState(false)
    const [essenceOrder, setEssenceOrder] = useState(true)
    const [brandOrder, setBrandOrder] = useState(false)
    const [quantityOrder, setQuantityOrder] = useState(false)



    //sobe os dados para os usestates ao carregar a pagina
    useEffect(() => {
        try {
            async function loadSchema() {
                var order = ''
                if (essenceOrder) order = 'name'
                if (brandOrder) order = 'brand.name'
                if (quantityOrder) order = 'quantity'
                const realm = await getRealm()
                const e = realm.objects('Essence')
                const essencesOrdered = order == 'name' || order == 'brand.name' ? e.sorted(order, false) : e.sorted(order, true)
                const b = realm.objects('Brand')
                const s = realm.objects('Suplier')
                // realm.write(() => {
                //     realm.deleteAll()
                // })

                setEssences(essencesOrdered)
                setBrands(b)
                setSupliers(s)
                essencesOrdered.addListener((values) => {
                    setEssences([...values])
                })
                b.addListener((values) => {
                    setBrands([...values])
                })
                s.addListener((values) => {
                    setSupliers([...values])
                })

                return () => {
                    essencesOrdered.removeAllListeners()
                    b.removeAllListeners()
                    s.removeAllListeners()
                }
            }
            loadSchema()
        } catch (error) {
            console.log(error)
        }

    }, [essenceOrder, brandOrder, quantityOrder])

    useEffect(() => {
        try {
            async function loadSchema2() {
                const realm = await getRealm()
                const e = realm.objects('Essence')
                const essencesBySearch = e.filtered(`name CONTAINS '${search}' || brand.name CONTAINS '${search}' `)
                setEssences(essencesBySearch)
                essencesBySearch.addListener((values) => {
                    setEssences([...values])
                })
                return () => {
                    essencesBySearch.removeAllListeners()
                }
            }
            loadSchema2()
        } catch (error) {
            console.log(error)
        }

    }, [search])


    // deleta marca
    async function deleteBrand(item) {
        try {
            const realm = await getRealm()
            const essencias = realm.objects('Essence')
            const marcalocalizada = essencias.filtered(`brand._id == "${item._id}"`).length
            if (marcalocalizada > 0) {
                setShowAlertBrandUsed(true)
            } else {
                realm.write(() => {
                    realm.delete(item)
                })
            }
        } catch (error) {
            console.log(error)
        }
    }



    // deleta fornecedor
    async function deleteSuplier(item) {
        try {
            const realm = await getRealm()
            const essencias = realm.objects('Essence')
            const marcalocalizada = essencias.filtered(`suplier._id == "${item._id}"`).length
            if (marcalocalizada > 0) {
                setShowAlertSuplierUsed(true)
            } else {
                realm.write(() => {
                    realm.delete(item)
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Salvando marca no banco
    async function saveNewBrand() {
        const realm = await getRealm()
        try {
            realm.write(() => {
                realm.create("Brand", {
                    _id: `${uuid()}`,
                    name: newBrand
                })
                setNewBrand('')

            })
        } catch (err) {
            console.log('[ERRO]: ' + err)
        }
    }


    // Salvando fornecedor no banco
    async function saveNewSuplier() {
        const realm = await getRealm()
        try {
            realm.write(() => {
                realm.create("Suplier", {
                    _id: `${uuid()}`,
                    name: newSuplier
                })
                setNewSuplier('')
            })
        } catch (err) {
            console.log('[ERRO]: ' + err)
        }
    }

    // selecionando marca no select (modal marca)
    const selectedBrand = (item) => {
        setMarca(item.name)
        setNewBrandFull(item)
        setBrandEmpty(false)
        setModalBrand(!modalBrand)
    }

    // selecionando forneceodr no select (modal fornecedor)
    const selectedSuplier = (item) => {
        setFornecedor(item.name)
        setNewSuplierFull(item)
        setModalSuplier(!modalSuplier)
    }



    // salvando essência no banco
    async function saveNewEssence() {
        var cont = 0
        if (newName == '' || newName == undefined) {
            cont++
            setNameEmpty(true)
        }
        if (!newBrandFull._id) {
            cont++
            setBrandEmpty(true)
        }
        if (newQuantity == '' || newQuantity == undefined) {
            cont++
            setQuantityEmpty(true)
        }
        if (newPrice == '' || newPrice == undefined || newPrice == 0) {
            cont++
            setPriceEmpty(true)
        }
        if (cont == 0) {
            const parsePrice = Number(newPrice) / Number(newQuantity)
            const parseQuantity = Number(newQuantity)
            const realm = await getRealm()
            var status = idUpdated == 0 ? 'never' : 'modified'
            
            var id = idUpdated == 0 ? `${uuid()}` : idUpdated
            const fornecedor = newSuplierFull._id ? newSuplierFull : null

            try {
                realm.write(() => {
                    realm.create("Essence", {
                        _id: id,
                        name: newName,
                        brand: newBrandFull,
                        taste: newTaste,
                        quantity: parseQuantity,
                        price: parsePrice,
                        suplier: fornecedor,
                        isEssence: isEssence
                    }, status)
                })
                setMarca('*Marca')
                setFornecedor('Fornecedor')
                setModalVisible(false)
                setNewBrandFull({})
                if (status == 'never' && essences.length % 2 !== 0) {                     
                    showInterstitial()
                }
            } catch (err) {
                console.log('[ERRO]: ' + err)
            }
        } else {
            return
        }

    }


    //Ao clicar no trigger Editar (manda o item do card = a essencia a ser editada)
    function updateEssence(data) {
        console.log(data._id)
        setIdUpdated(data._id)
        setNewName(data.name)
        setNewQuantity(data.quantity.toFixed(2))
        setNewPrice((data.price * data.quantity).toFixed(2))
        if (data.taste) setNewTaste(data.taste)
        if (data.suplier) {
            setFornecedor(data.suplier.name)
            setNewSuplierFull(data.suplier)
        }
        setNewBrandFull(data.brand)
        setMarca(data.brand.name)
        setModalVisible(true)
        setIsEssence(data.isEssence)
    }

    return (
        <>

            <Header />
            <View style={styles.container} >
                <AwesomeAlert
                    show={showAlertBrandUsed}
                    showProgress={false}
                    title="Não foi possível excluir"
                    message={`Essa marca já está vinculada a alguma essência. `}
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={true}
                    cancelText="Cancelar."
                    confirmText="Ok, entendi."
                    confirmButtonColor={estilo.colors.laranja}
                    onCancelPressed={() => setShowAlert(false)}
                    onConfirmPressed={() => {
                        setShowAlertBrandUsed(false)
                    }}
                />
                <AwesomeAlert
                    show={showAlertSuplierUsed}
                    showProgress={false}
                    title="Não foi possível excluir."
                    message={`Esse fornecedor já está vinculado a alguma essência. `}
                    closeOnTouchOutside={false}
                    closeOnHardwareBackPress={false}
                    showCancelButton={false}
                    showConfirmButton={true}
                    cancelText="Cancelar."
                    confirmText="Ok, entendi."
                    confirmButtonColor={estilo.colors.laranja}
                    onCancelPressed={() => setShowAlert(false)}
                    onConfirmPressed={() => {
                        setShowAlertSuplierUsed(false)
                    }}
                />


                <View style={{ paddingHorizontal: RFValue(20), marginTop: RFValue(10), marginBottom: RFValue(30) }}>

                    <TextInput
                        style={styles.input}
                        mode='outlined'
                        keyboardType='default'
                        label="Pesquise pela essência ou marca"
                        placeholder='Ex: Strawberry Ripe'
                        placeholderTextColor={'#999'}
                        outlineColor={estilo.colors.azul}
                        activeOutlineColor={estilo.colors.laranja}
                        selectionColor='#ccc'
                        value={search}
                        onChangeText={search => setSearch(search)}
                    />


                </View>

                <View style={styles.viewButtonNew}>
                    <TouchableOpacity onPress={() => {
                        setMarca('*Marca')
                        setFornecedor('Fornecedor')
                        setNewName('')
                        setNewQuantity('')
                        setNewPrice('')
                        setNewTaste('')
                        setIdUpdated(0)
                        setIsEssence(true)
                        setPriceEmpty(false)
                        setBrandEmpty(false)
                        setNameEmpty(false)
                        setQuantityEmpty(false)
                        setNewSuplierFull({})
                        setModalVisible(true)
                    }}>
                        <View style={{ justifyContent: 'space-around', flexDirection: 'row', paddingVertical: RFValue(7), backgroundColor: 'transparent', paddingHorizontal: RFValue(10), borderWidth: RFValue(2), borderColor: estilo.colors.laranja, borderRadius: RFValue(10), alignItems: 'center' }}>
                            <FontAwesome name='plus' size={RFValue(14)} color={estilo.colors.laranja} />
                            <Text style={{ marginLeft: RFValue(7), color: estilo.colors.laranja }}>Cadastrar Essência</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* cabeçalho das colunas (nome, marca, quantidade) */}
                {
                    essences.length >= 1 ?
                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <TouchableWithoutFeedback onPress={() => {
                                setEssenceOrder(true)
                                setBrandOrder(false)
                                setQuantityOrder(false)
                            }}>
                                <View style={{ width: '45%' }}>
                                    <Text style={{ marginLeft: RFValue(10), color: 'black', fontWeight: essenceOrder ? 'bold' : 'regular' }}>Essência</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => {
                                setBrandOrder(true)
                                setEssenceOrder(false)
                                setQuantityOrder(false)
                            }}>
                                <View style={{ width: '30%', alignItems: 'center' }}><Text style={{ color: 'black', fontWeight: brandOrder ? 'bold' : 'regular' }}>Marca</Text></View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => {
                                setQuantityOrder(true)
                                setBrandOrder(false)
                                setEssenceOrder(false)
                            }}>
                                <View style={{ width: '15%', alignItems: 'flex-end', paddingRight: RFValue(10) }}><Text style={{ color: 'black', fontWeight: quantityOrder ? 'bold' : 'regular' }}>Qtde</Text></View>
                            </TouchableWithoutFeedback>
                            <View style={{ width: '10%' }} />
                        </View>
                        : <View style={{ justifyContent: 'flex-start' }}><Image source={require('../assets/background/empty.jpg')} resizeMode='contain' style={{ width: '100%', height: RFValue(250), justifyContent: "flex-start" }} /></View>
                }
                <FlatList
                    data={essences}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => <CardEssence updateEssence={updateEssence} item={item} />}
                    ItemSeparatorComponent={<SeparatorFlatlist />}
                />




                <Modal visible={modalVisible} onDismiss={() => setModalVisible(!modalVisible)} onRequestClose={() => setModalVisible(!modalVisible)} animationType="fade"
                    transparent={true} >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                    </TouchableWithoutFeedback>


                    {/* Bloco central do modal de inserir essência*/}
                    <View flexDirection='row' >

                        {/* parte lateral do modal cadastro de essencia */}
                        <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />

                        {/*Modal cadastro de essencia */}
                        <View style={{ width: '94%', paddingTop: RFValue(20), height: '100%', borderWidth: 1, borderColor: estilo.colors.laranja, alignSelf: 'center', backgroundColor: 'white' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginLeft: RFValue(10) }}>
                                <Switch
                                    trackColor={{ false: '#767577', true: '#FAB709' }}
                                    thumbColor={isEssence ? estilo.colors.laranja : '#f4f3f4'}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={() => setIsEssence(!isEssence)}
                                    value={isEssence}
                                />
                                <Text style={styles.buttonText}>É essência ?</Text>
                            </View>

                            <TextInput
                                style={styles.inputModal}
                                mode='outlined'
                                keyboardType='default'
                                label="*Nome"
                                placeholder='Ex: Strawberry Ripe'
                                placeholderTextColor={'#999'}
                                outlineColor={estilo.colors.azul}
                                activeOutlineColor={estilo.colors.laranja}
                                selectionColor='#ccc'
                                maxLength={20}
                                value={newName}
                                onChangeText={name => {
                                    setNewName(name)
                                    setNameEmpty(false)
                                }}
                            />
                            {nameEmpty ? <Text style={{ color: '#999', width: '90%', alignSelf: 'center' }}>*Informe o nome</Text> : false}

                            <TouchableWithoutFeedback onPress={() => setModalBrand(true)}>
                                <View style={{ width: '90%', borderWidth: 1, alignSelf: 'center', height: RFValue(50), backgroundColor: 'white', marginTop: RFValue(5), borderRadius: RFValue(3), flexDirection: 'row', alignItems: 'center' }}>
                                    {/* <Fontisto name='brand' size={RFValue(14)} color={estilo.colors.laranja} /> */}
                                    <Text style={{ color: estilo.colors.azul, marginLeft: RFValue(12), fontSize: RFValue(15) }}>{marca}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            {brandEmpty ? <Text style={{ color: '#999', width: '90%', alignSelf: 'center' }}>*Informe a marca</Text> : false}


                            {/* Modal cadastro de marca */}
                            <Modal visible={modalBrand} onDismiss={() => setModalBrand(!modalBrand)} onRequestClose={() => setModalBrand(!modalBrand)} animationType="fade"
                                transparent={true} >
                                <TouchableWithoutFeedback onPress={() => setModalBrand(!modalBrand)}>
                                    <View style={{ flex: 3, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                </TouchableWithoutFeedback>

                                <View style={{ flex: 6, backgroundColor: 'white', paddingVertical: RFValue(15) }}>
                                    <View style={{ flex: 4, borderWidth: 1, borderRadius: RFValue(5), borderColor: estilo.colors.azul, paddingHorizontal: RFValue(10), marginHorizontal: RFValue(10) }}>
                                        <FlatList
                                            data={brands}
                                            scrollEnabled
                                            keyExtractor={item => item._id}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    onLongPress={() => {
                                                        deleteBrand(item)
                                                    }}
                                                    onPress={() => selectedBrand(item)}>
                                                    <View style={{ height: RFValue(50), borderBottomWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ color: estilo.colors.azul, fontSize: RFValue(15) }}>{item.name}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                    <View style={{ paddingHorizontal: RFValue(20), flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            style={[styles.inputModal, { height: RFValue(50) }]}
                                            mode='outlined'
                                            keyboardType='default'
                                            label="Nova marca"
                                            placeholder='Cadastre uma nova marca'
                                            placeholderTextColor={'#999'}
                                            outlineColor={estilo.colors.azul}
                                            activeOutlineColor={estilo.colors.laranja}
                                            maxLength={12}
                                            selectionColor='#ccc'
                                            value={newBrand}
                                            onChangeText={text => setNewBrand(text)}
                                        />

                                        <TouchableOpacity
                                            onPress={() => {
                                                if (newBrand !== '') {
                                                    saveNewBrand()
                                                } else {
                                                    return
                                                }
                                            }}
                                        >
                                            <View style={{ borderRadius: RFValue(5), alignItems: 'center', justifyContent: 'center', height: RFValue(35), width: RFValue(35), backgroundColor: estilo.colors.laranja, marginLeft: RFValue(5), marginTop: RFValue(10) }}>
                                                <FontAwesome name='plus' size={30} color='white' />
                                            </View>

                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableWithoutFeedback onPress={() => setModalBrand(!modalBrand)}>
                                    <View style={{ flex: 4, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                                </TouchableWithoutFeedback>

                            </Modal>

                            <TextInput
                                style={styles.inputModal}
                                label="*Quantidade (ml)"
                                mode='outlined'
                                keyboardType='number-pad'
                                placeholder='Ex: 15'
                                placeholderTextColor={'#999'}
                                outlineColor={estilo.colors.azul}
                                activeOutlineColor={estilo.colors.laranja}
                                selectionColor='#ccc'
                                value={`${newQuantity}`}
                                maxLength={8}
                                onChangeText={quantity => {
                                    if (regex.test(quantity)) {
                                        setNewQuantity(quantity)
                                    } else {
                                        if (quantity.indexOf('.') > 0 && quantityRegex == 0) {
                                            setNewQuantity(quantity)
                                            setQuantityRegex(1)
                                        } else {
                                            return
                                        }
                                    }
                                    if (!quantity.includes('.')) setQuantityRegex(0)
                                    setQuantityEmpty(false)
                                }}
                            />
                            {quantityEmpty ? <Text style={{ color: '#999', width: '90%', alignSelf: 'center' }}>*Informe a quantidade</Text> : false}

                            <TextInput
                                style={styles.inputModal}
                                label="*Preço da quantidade informada ($)"
                                mode='outlined'
                                placeholder='Ex: 25,00'
                                placeholderTextColor={'#999'}
                                keyboardType='number-pad'
                                outlineColor={estilo.colors.azul}
                                activeOutlineColor={estilo.colors.laranja}
                                selectionColor='#ccc'
                                value={`${newPrice}`}
                                maxLength={8}
                                onChangeText={price => {
                                    if (regex.test(price)) {
                                        setNewPrice(price)
                                    } else {
                                        if (price.indexOf('.') > 0 && priceRegex == 0) {
                                            setNewPrice(price)
                                            setPriceRegex(1)
                                        } else {
                                            return
                                        }
                                    }
                                    if (!price.includes('.')) setPriceRegex(0)
                                    setPriceEmpty(false)
                                }}
                            />
                            {priceEmpty ? <Text style={{ color: '#999', width: '90%', alignSelf: 'center' }}>*Informe o preço</Text> : false}

                            <TextInput
                                style={styles.inputModal}
                                mode='outlined'
                                keyboardType='default'
                                label="Sabor"
                                placeholder='Ex: Suco de morango'
                                placeholderTextColor={'#999'}
                                outlineColor={estilo.colors.azul}
                                activeOutlineColor={estilo.colors.laranja}
                                selectionColor='#ccc'
                                value={newTaste}
                                maxLength={16}
                                onChangeText={taste => setNewTaste(taste)}
                            />

                            {/* input fornecedor que abre modal */}
                            <TouchableWithoutFeedback onPress={() => setModalSuplier(true)}>
                                <View style={{ width: '90%', borderWidth: 1, alignSelf: 'center', height: RFValue(50), backgroundColor: 'white', marginTop: RFValue(5), borderRadius: RFValue(3), flexDirection: 'row', alignItems: 'center' }}>
                                    {/* <Fontisto name='brand' size={RFValue(14)} color={estilo.colors.laranja} /> */}
                                    <Text style={{ color: estilo.colors.azul, marginLeft: RFValue(12), fontSize: RFValue(15) }}>{fornecedor}</Text>
                                </View>
                            </TouchableWithoutFeedback>

                            {/* Modal cadastro de fornecedor */}
                            <Modal visible={modalSuplier} onDismiss={() => setModalSuplier(!modalSuplier)} onRequestClose={() => setModalSuplier(!modalSuplier)} animationType="fade"
                                transparent={true} >
                                <TouchableWithoutFeedback onPress={() => setModalSuplier(!modalSuplier)}>
                                    <View style={{ flex: 3, backgroundColor: 'rgba(0,0,0,0.6)' }}></View>
                                </TouchableWithoutFeedback>
                                <View style={{ flex: 6, backgroundColor: 'white', paddingVertical: RFValue(15) }}>
                                    <View style={{ flex: 4, borderWidth: 1, borderRadius: RFValue(5), borderColor: estilo.colors.azul, paddingHorizontal: RFValue(10), marginHorizontal: RFValue(10) }}>
                                        <FlatList
                                            data={supliers}
                                            scrollEnabled
                                            keyExtractor={item => item._id}
                                            renderItem={({ item }) => (

                                                <TouchableWithoutFeedback onLongPress={() => deleteSuplier(item)} onPress={() => selectedSuplier(item)}>
                                                    <View style={{ height: RFValue(50), borderBottomWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ color: estilo.colors.azul, fontSize: RFValue(15) }}>{item.name}</Text>
                                                    </View>
                                                </TouchableWithoutFeedback>

                                            )}
                                        />
                                    </View>
                                    <View style={{ paddingHorizontal: RFValue(20), flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            style={[styles.inputModal, { height: RFValue(50) }]}
                                            mode='outlined'
                                            keyboardType='default'
                                            label="Novo fornecedor"
                                            placeholder='Cadastre um novo fornecedor'
                                            placeholderTextColor={'#999'}
                                            outlineColor={estilo.colors.azul}
                                            activeOutlineColor={estilo.colors.laranja}
                                            selectionColor='#ccc'
                                            value={newSuplier}
                                            maxLength={12}
                                            onChangeText={text => setNewSuplier(text)}
                                        />

                                        <TouchableOpacity
                                            onPress={() => {
                                                if (newSuplier !== '') {
                                                    saveNewSuplier()
                                                } else {
                                                    return
                                                }
                                            }}
                                        >
                                            <View style={{ borderRadius: RFValue(5), alignItems: 'center', justifyContent: 'center', height: RFValue(35), width: RFValue(35), backgroundColor: estilo.colors.laranja, marginLeft: RFValue(5), marginTop: RFValue(10) }}>
                                                <FontAwesome name='plus' size={RFValue(30)} color='white' />
                                            </View>

                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableWithoutFeedback onPress={() => setModalSuplier(!modalSuplier)}>
                                    <View style={{ flex: 4, backgroundColor: 'rgba(0,0,0,0.6)' }}></View>
                                </TouchableWithoutFeedback>
                            </Modal>

                            <TouchableOpacity
                                onPress={() => saveNewEssence()}
                            >
                                <View style={styles.button}>
                                    <Text style={styles.buttonText}>Salvar essência</Text>
                                </View>

                            </TouchableOpacity>





                        </View>
                        <View style={{ width: '3%', backgroundColor: 'rgba(0,0,0,0.6)' }} />
                    </View>
                    <TouchableWithoutFeedback onPress={() => {
                        setPriceEmpty(false)
                        setBrandEmpty(false)
                        setNameEmpty(false)
                        setQuantityEmpty(false)
                        setModalVisible(false)
                    }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
                    </TouchableWithoutFeedback>
                </Modal>


                <View style={{ height: RFValue(70) }}></View>
            </View >
        </>
    )
}

const styles = StyleSheet.create({
    wrapper: {},
    slide1: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: RFValue(5)
    },
    inputModal: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: RFValue(10),
        height: RFValue(50),
        fontSize: RFValue(15),
        backgroundColor: 'white',
        color: estilo.colors.azul
    },
    container: {
        flex: 1,

        backgroundColor: 'white',

    },
    body: {
        borderRadius: RFValue(10),
        height: '85%',
        width: '100%',
        paddingVertical: RFValue(20),
        paddingHorizontal: RFValue(20),
        alignSelf: 'center',
        backgroundColor: 'white'

    },
    viewButtonNew: {
        alignSelf: 'flex-end',
        marginRight: RFValue(10),
        marginVertical: RFValue(10),
        justifyContent: 'flex-start',
    },
    inputSearch: {
        marginBottom: RFValue(5),
        backgroundColor: 'white',
        fontSize: RFValue(15),
        // height: RFValue(50),
        borderRadius: RFValue(5),
    },

    input: {
        marginBottom: RFValue(5),
        backgroundColor: 'white',
        fontSize: RFValue(15),
        height: RFValue(50),
        borderRadius: RFValue(5)
    },
    modalView: {
        justifyContent: 'center',
        backgroundColor: estilo.colors.azul,
        borderRadius: RFValue(20),
        paddingVertical: RFValue(40),
        paddingHorizontal: RFValue(15),
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
    button: {
        backgroundColor: estilo.colors.laranja,
        width: '90%',
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
    wrapper: {
        justifyContent: 'center'

    },
    card: {
        width: '90%',
        height: RFValue(70),
        backgroundColor: estilo.colors.cinza
    },
    textCard: {
        color: estilo.colors.azul,
        fontSize: RFValue(20)
    },
    cardEssence: {
        width: '100%',
        backgroundColor: estilo.colors.cinza,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        flexDirection: 'row',
        padding: RFValue(10),
        elevation: 1,
        borderRadius: RFValue(5)
    },
    textCardEssence: {
        color: estilo.colors.azul,
        backgroundColor: estilo.colors.cinza,
        fontSize: RFValue(15),
        fontFamily: estilo.fonts.padrao
    },

})