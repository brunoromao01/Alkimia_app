import React, { useState } from 'react'
import { Text, View, StyleSheet, TouchableWithoutFeedback, Image, ToastAndroid } from 'react-native'
import { RFValue } from "react-native-responsive-fontsize"
import estilo from '../estilo'
import AwesomeAlert from 'react-native-awesome-alerts'
import { getRealm } from '../services/realm'
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

export default props => {
    const [showFullCard, setShowFullCard] = useState(false)
    const [showAlertConfirmation, setShowAlertConfirmation] = useState(false)
    const fornecedor = props.item.suplier == null ? '--' : props.item.suplier.name

    const showToast = (message) => {
        ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
    }

    // deleta essencia
    async function deleteEssence() {
        try {
            const realm = await getRealm()
            const receitas = realm.objects('Recipe')
            const essencialocalizada = receitas.filtered(`essences._id == "${props.item._id}"`).length

            if (essencialocalizada > 0) {
                showToast('Essência usada em alguma receita, não é possível excluí-la')
            } else {
                realm.write(() => {
                    realm.delete(props.item)
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={[styles.cardEssence]}>
            <AwesomeAlert
                show={showAlertConfirmation}
                showProgress={false}
                title="Confirmação de exclusão"
                message={`Deseja realmente excluir essa essência ? `}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                cancelText="Cancelar exclusão."
                confirmText="Sim, quero excluir."
                confirmButtonColor={estilo.colors.laranja}
                onCancelPressed={() => setShowAlertConfirmation(false)}
                onConfirmPressed={() => {
                    setShowAlertConfirmation(false)
                    deleteEssence()
                }}
            />

            <TouchableWithoutFeedback
                onPress={() => setShowFullCard(!showFullCard)}
            >
                <View style={{ width: '100%', flexDirection: 'row' }}>

                    <View style={{ width: '45%' }}>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.textCardEssence}>{props.item.name}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'center' }}>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.textCardEssence}>{props.item.brand.name}</Text>
                    </View>
                    <View style={{ width: '15%', alignItems: 'flex-end', marginRight: RFValue(5) }}>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.textCardEssence}>{(props.item.quantity).toFixed(2)}</Text>
                    </View>
                    <View style={{ width: '5%', alignItems: 'flex-end', }}>
                        <Menu>
                            <MenuTrigger customStyles={{ triggerText: { color: estilo.colors.azul } }} text='>' />
                            <MenuOptions>
                                <MenuOption onSelect={() => setShowAlertConfirmation(true)}>
                                    <Text style={{ color: 'black' }}>Deletar</Text>
                                </MenuOption>
                                <MenuOption onSelect={() => props.updateEssence(props.item)}  >
                                    <Text style={{ color: 'black' }}>Editar</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </View>
                    <View style={{ width: '5%'}}/>

                </View>
            </TouchableWithoutFeedback>

            {
                showFullCard ?
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: RFValue(5) }}>
                            <View style={{ width: '33%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <Image style={{ width: RFValue(25), height: RFValue(25) }} source={require('../assets/colorIcon/delivery-truck.png')} />
                                <Text style={[styles.textCardEssence, { marginLeft: RFValue(5) }]} adjustsFontSizeToFit numberOfLines={1}>{fornecedor}</Text>
                            </View>
                            <View style={{ width: '34%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: RFValue(5) }}>
                                <Image style={{ width: RFValue(20), height: RFValue(20) }} source={require('../assets/colorIcon/strawberry.png')} />
                                <Text style={[styles.textCardEssence, { marginLeft: RFValue(5) }]} adjustsFontSizeToFit numberOfLines={1}>{props.item.taste ? props.item.taste : '--'}</Text>
                            </View>
                            <View style={{ width: '33%', flexDirection: 'row', justifyContent: 'flex-end', marginRight: RFValue(10), alignItems: 'center', }}>
                                <Image style={{ width: RFValue(25), height: RFValue(20) }} resizeMode='contain' source={require('../assets/colorIcon/dollar.png')} />
                                <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.textCardEssence, { marginLeft: RFValue(5), marginRight: RFValue(10) }]}>{(props.item.price).toFixed(2)}(p/ml)</Text>
                            </View>

                        </View>
                    </>
                    : false
            }

        </View>
    )
}
const styles = StyleSheet.create({
    cardEssence: {
        width: '100%',
        backgroundColor: estilo.colors.cinza,
        borderRadius: RFValue(5),
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
        fontFamily: estilo.fonts.padrao
    },
    textCardRecipeBottom: {
        color: estilo.colors.azul,
        backgroundColor: estilo.colors.cinza,
        fontSize: RFValue(15),
        fontFamily: estilo.fonts.padrao
    }
})