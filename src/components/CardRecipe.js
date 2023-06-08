import React, { useState } from 'react'
import { Text, View, StyleSheet, TouchableWithoutFeedback, ScrollView, FlatList } from 'react-native'
import { RFValue } from "react-native-responsive-fontsize"
import AwesomeAlert from 'react-native-awesome-alerts';
import estilo from '../estilo'
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

export default ({ data, deletingRecipe, producingRecipe, editingRecipe, cloningRecipe }) => {
    const [showFullCard, setShowFullCard] = useState(false)
    const [showAlertConfirmationExclusion, setShowAlertConfirmationExclusion] = useState(false)
    const essencias = data.essences
    const percents = data.percents
    const vg = data.vg
    const pg = data.pg
    const name = data.name

    return (
        <View style={[styles.cardEssence]}>
            <AwesomeAlert
                show={showAlertConfirmationExclusion}
                showProgress={false}
                title="Confirmação de exclusão:"
                message={`Deseja realmente excluir essa essência ? (esse processo é irreverssível) `}
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                cancelText="Cancelar."
                confirmText="Sim, quero excluir."
                confirmButtonColor={estilo.colors.laranja}
                onCancelPressed={() => setShowAlertConfirmationExclusion(false)}
                onConfirmPressed={() => {
                    setShowAlertConfirmationExclusion(false)
                    deletingRecipe(data)
                }}
            />

            <TouchableWithoutFeedback
                onPress={() => setShowFullCard(!showFullCard)}
            >
                <View style={{ width: '100%', flexDirection: 'row' }}>
                    <View style={{ width: '65%' }}>
                        <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.textCardRecipe, { fontFamily: estilo.fonts.padrao }]}>{name}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'center' }}>
                        <Text style={[styles.textCardRecipe, { fontFamily: estilo.fonts.padrao }]}>{vg}/{pg}</Text>
                    </View>
                    <View style={{ width: '5%', justifyContent: 'center' }}>
                        <Menu>
                            <MenuTrigger customStyles={{ triggerText: { color: estilo.colors.azul } }} text='>' />
                            <MenuOptions>
                                <MenuOption onSelect={() => setShowAlertConfirmationExclusion(true)}><Text style={{ color: 'black' }}>Deletar</Text></MenuOption>
                                <MenuOption onSelect={() => editingRecipe(data)} ><Text style={{ color: 'black' }}>Editar</Text></MenuOption>
                                <MenuOption onSelect={() => cloningRecipe(data)} ><Text style={{ color: 'black' }}>Clonar</Text></MenuOption>
                                <MenuOption onSelect={() => producingRecipe(data)} ><Text style={{ color: 'black' }}>Produzir</Text></MenuOption>

                            </MenuOptions>
                        </Menu>

                    </View>
                </View>
            </TouchableWithoutFeedback>

            {
                showFullCard ?
                    <>

                        <View style={{ width: '90%', backgroundColor: '#fafafa', marginTop: RFValue(5), paddingVertical: RFValue(5), borderRadius: RFValue(5) }}>
                            <FlatList
                                data={essencias}
                                renderItem={({ item, index }) => (
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingHorizontal: RFValue(10) }}>
                                        <View style={{ width: '50%', alignItems: 'flex-start' }}>
                                            <Text style={styles.textCardEssence} adjustsFontSizeToFit numberOfLines={1}>{item.name}</Text>
                                        </View>
                                        <View style={{ width: '35%', alignItems: 'center' }}>
                                            <Text style={styles.textCardEssence} adjustsFontSizeToFit numberOfLines={1}>{item.brand.name}</Text>
                                        </View>
                                        <View style={{ width: '15%', alignItems: 'center' }}>
                                            <Text style={styles.textCardEssence} adjustsFontSizeToFit numberOfLines={1}>{percents[index]}%</Text>
                                        </View>
                                    </View>
                                )
                                }
                            />
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
})