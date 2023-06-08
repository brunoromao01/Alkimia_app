import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, TouchableWithoutFeedback, Alert, TextInput as Txtinp } from 'react-native'
import { TextInput } from 'react-native-paper'
import estilo from '../estilo'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Feather from 'react-native-vector-icons/Feather'
import { getRealm } from '../services/realm'
import { RFValue } from 'react-native-responsive-fontsize'
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

export default ({ item, refresh, search, getData }) => {
    const [editEssence, setEditEssence] = useState({
        _id: item._id,
        name: item.name,
        brand: item.brand,
        taste: item.taste,
        quantity: item.quantity,
        price: item.price,
        suplier: item.suplier
    })



    function confirmDeletion() {
        Alert.alert(
            'Confirmação de exclusão:',
            'Deseja realmente excluir essa essência ?',
            [{
                text: 'Excluir',
                onPress: () => deleteEssence(),
            },
            {
                text: 'Cancelar',
                onPress: () => { },
                style: 'cancel',
            },
            ],
            {
                cancelable: true,
                onDismiss: () => { }
            },
        );
    }


    async function deleteEssence() {
        const realm = await getRealm()
        try {
            realm.write(() => {
                const essenceWilDeleted = realm.objectForPrimaryKey("Essence", editEssence._id)

                realm.delete(essenceWilDeleted)
                refresh()
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <View style={[styles.cardEssence]}>
                <View style={{ width: '100%', flexDirection: 'row' }}>
                    <View style={{ width: '45%' }}>
                        <Text style={[styles.textCardEssence, { fontFamily: estilo.fonts.padrao }]}>{editEssence.name}</Text>
                    </View>
                    <View style={{ width: '40%' }}>
                        <Text style={[styles.textCard, { fontFamily: estilo.fonts.padrao }]}>{editEssence.brand.name}</Text>
                    </View>
                    <View style={{ width: '10%', alignItems: 'center', marginRight: RFValue(5) }}>
                        <Text style={[styles.textCard, { fontFamily: estilo.fonts.padrao }]}>{editEssence.quantity}</Text>

                    </View>
                    <View style={{ width: '5%' }}>
                        <Menu>
                            <MenuTrigger customStyles={{ triggerText: { color: 'black' } }} text='>' />
                            <MenuOptions>
                                <MenuOption onSelect={() => confirmDeletion()} text='Deletar' />
                                <MenuOption onSelect={() => getData(editEssence)} text='Editar'  >
                                </MenuOption>
                            </MenuOptions>
                        </Menu>

                    </View>





                </View>


            </View>
        </>
    )
}

const styles = StyleSheet.create({
    cardEssence: {
        width: '100%',

        backgroundColor: estilo.colors.cinza,

        borderTopWidth: 1,
        borderTopColor: '#ccc',
        flexDirection: 'row',
        padding: 10,
        elevation: 1
    },
    textCardEssence: {
        color: estilo.colors.azul,
        backgroundColor: estilo.colors.cinza,
        fontSize: 15,
        fontFamily: estilo.fonts.padrao
    },
    textCardEdit: {
        color: estilo.colors.azul,
        backgroundColor: 'white',
        fontSize: 12,
        flex: 1,
        height: RFValue(40),
        borderRadius: 5,

    },
})