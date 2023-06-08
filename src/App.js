import React from 'react'
import { Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import Tab from './navigation/Tab'
import 'react-native-get-random-values'
import { MenuProvider } from 'react-native-popup-menu';

export default props => {

    return (
        <MenuProvider>
            <View style={{ flex: 1 }}>
                <NavigationContainer>
                    <Tab />
                </NavigationContainer>

            </View>
        </MenuProvider>
    )
}