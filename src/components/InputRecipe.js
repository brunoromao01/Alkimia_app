import React, { useState } from 'react'
import { Text, View, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RFValue } from "react-native-responsive-fontsize"
import estilo from '../estilo'
import SeparatorFlatlist from './SeparatorFlatlist'

export default ({ data, deletion, index, vg }) => {
    // const [quantidade, setQuantidade] = useState([])
    return (
        <View>



            <View flexDirection='row' style={styles.cardEssence}>
                <View style={{ width: '70%' }}>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={styles.textCardEssence}>{data.essencia.name} - {data.essencia.brand.name}</Text>
                </View>

                <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.textCardEssence}>{data.percent}%</Text>
                </View>
                <TouchableWithoutFeedback onPress={() => deletion(data, index)}>
                    <View style={{ width: '10%', alignItems: 'flex-end' }}>
                    <Image style={{ width: RFValue(15), height: RFValue(15) }} source={require('../assets/colorIcon/trash-bin.png')} />
                    </View>
                </TouchableWithoutFeedback>

            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    cardEssence: {
        width: '100%',
        backgroundColor: estilo.colors.cinza,
        // borderTopWidth: 1,
        // borderTopColor: '#ccc',
        padding: RFValue(10),
        elevation: 1,
        // borderRadius: RFValue(5)
    },
    textCardEssence: {
        color: estilo.colors.azul,
        backgroundColor: estilo.colors.cinza,
        fontSize: RFValue(15),
        fontFamily: estilo.fonts.padrao
    },
})