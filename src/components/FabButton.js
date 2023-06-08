import React, { Component } from 'react'
import { StyleSheet, View, Animated, TouchableWithoutFeedback } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import estilo from '../estilo'

export default class FabButton extends Component {


    animation = new Animated.Value(0);

    toggleMenu = () => {
        const toValue = this.open ? 0 : 1;

        Animated.spring(this.animation, {
            toValue,
            friction: 4,
        }).start();

        this.open = !this.open;
    }

    render() {

        const fornecedorStyle = {
            transform: [
                { scale: this.animation },
                {
                    translateY: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20]
                    })
                }
            ]
        }

        const marcaStyle = {
            transform: [
                { scale: this.animation },
                {
                    translateY: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30]
                    })
                }
            ]
        }

        const rotation = {
            transform: [
                {
                    rotate: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '45deg']
                    })

                }
            ]
        }
        return (

            <View style={[styles.container, this.props.style]}>
                <TouchableWithoutFeedback onPress={() => this.props.funcao('fornecedor')}>
                    <Animated.View style={[styles.button, styles.submenu, marcaStyle]}>
                        <FontAwesome name="truck" size={24} color={estilo.colors.laranja} />
                    </Animated.View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback onPress={() => {
                    this.toggleMenu()
                    this.props.funcao('marca')
                }}>
                    <Animated.View style={[styles.button, styles.submenu, fornecedorStyle]}>
                        <FontAwesome name="tags" size={24} color={estilo.colors.laranja} />
                    </Animated.View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback onPress={this.toggleMenu}>
                    <Animated.View style={[styles.button, styles.menu, rotation]}>
                        <AntDesign name='plus' size={35} color={estilo.colors.azul} />
                    </Animated.View>
                </TouchableWithoutFeedback>


            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        position: 'absolute'
    },
    button: {
        // position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    menu: {
        backgroundColor: estilo.colors.laranja

    },
    submenu: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        backgroundColor: estilo.colors.azul
    }
})


