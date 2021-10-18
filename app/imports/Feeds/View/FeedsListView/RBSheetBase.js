
/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";


const { width, height } = Dimensions.get("window")

const RBSSheetBase = React.memo((props) => {
    const { buttons = [], sheetRef } = props

    return (
        <RBSheet
            ref={(i) => {
                sheetRef.current = i
            }}
            statusBarTranslucent={true}
            height={290}
            onClose={() => {
                onPause(false)
            }}
            openDuration={250}
            customStyles={{
                container: {
                    backgroundColor: "transparent",
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            }}>
            <View style={styles.listGrid}>
                {buttons.map((i) => {
                    return (<View key={i.name} style={styles.btnBox}>
                        {i.list.map((i1, index) => {
                            return (
                                <Pressable
                                    style={styles.listButton}
                                    onPress={i1.func}>
                                    <View style={[styles.listValueBox, i.list.length > 1 && index < i.list.length - 1 ? styles.bottomLine : {}]}>
                                        <Text style={[styles.listValue, i1.style]}>{i1.name}</Text>
                                    </View>
                                </Pressable>
                            )
                        })}
                    </View>)
                })}
            </View>
        </RBSheet>
    )
})
const styles = StyleSheet.create({
    root: {
        height: 100,
        width: "100%",
        backgroundColor: "#000000FF",
        justifyContent: "center",
        alignItems: "flex-end",
        position: "absolute",
        bottom: 0,
    },
    loadingBox: {
        width: "100%",
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
    },
    dotContainer: {
        padding: 11,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    textBox: {
        flexDirection: "row",
        flex: 1,
    },
    circle: {
        color: "#836BFFFF",
        shadowColor: '#999',
        backgroundColor: '#fff',
        borderRadius: 35,
        borderWidth: 5,
    },
    uploadingText: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20,
        color: "#FFFFFFFF"
    },
    failText: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20,
        color: "#FFFFFFFF"
    },
    tryText: {
        fontSize: 15,
        fontWeight: "600",
        lineHeight: 21,
        color: "#FFFFFFFF"
    },
    dotBox: {
        flexDirection: "row",
        height: 40,
        width: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    dot: {
        backgroundColor: "white",
        width: 6,
        height: 6,
        borderRadius: 6,
        marginLeft: 6,
    },
    failDot: {
        width: 3,
        height: 3,
        borderRadius: 3,
        marginLeft: 3,
    },

    listGrid: {
        flex: 1,
        padding: 25,
        backgroundColor: "transparent"
    },

    btnBox: {
        backgroundColor: "#FFFFFFFF",
        borderRadius: 14,
        marginBottom: 8
    },
    listButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listValueBox: {
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
    },
    bottomLine: {
        borderBottomColor: "#D9D9D94D",
        borderBottomWidth: 1,
    },
    listValue: {
        fontSize: 18,
        fontWeight: "400",
        lineHeight: 24,
        color: "#000000FF"
    },
    overlayBox: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: -400,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayBoxInner: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    popoverback: {
        position: 'absolute',
        width: width,
        height: height,
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progress: {
        fontSize: 14,
    },
    popoverbackInner: {
        width: '100%',
        height: '100%',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255, 0.3)',
    },
    popoverroot: {
        position: 'absolute',

        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, .9)',
        // height: 170,
        padding: 30,
        width: 225,
        borderRadius: 10,
    },
    reuploadButton: {
        backgroundColor: '#836BFFFF',
        borderRadius: 5,
        marginTop: 28,
        width: 124,
        height: 40,
    },
    popover: {
        paddingTop: (25),
    },
});
export default RBSSheetBase