/* eslint-disable react/no-unused-prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View, Pressable, Text, TouchableOpacity, Alert } from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet"
import ImageMap from "../../../images"
import I18n from '../../../../../i18n';
import log, { logEvent } from '../../../../../utils/log';
import RocketChat from '../../../../../lib/rocketchat';
import events from '../../../../../utils/log/events';
import EventEmitter from '../../../../../utils/events';
import AsyncStorage from '@react-native-community/async-storage';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CameraRoll from '@react-native-community/cameraroll';
import ProgressCircle from 'react-native-progress-circle';
import { Button, Image } from 'react-native-elements';

import { FileSystem } from 'react-native-unimodules';

const { downLoadingGif, successPng } = ImageMap

const UploadResult = React.memo(props => {
    const { setOpen, setPercent } = props;
    return (
        <>
            <Image
                source={successPng}
                style={styles.statusImage}
                placeholderStyle={{
                    backgroundColor: 'transparent',
                }}
            />
            <Text style={styles.statusText}>{t('downloadSuccess')}</Text>
            <Button
                buttonStyle={styles.reuploadButton}
                title={I18n.t('confirm')}
                titleStyle={{ fontSize: 16, fontWeight: '500' }}
                onPress={() => {
                    setPercent(0);
                    setOpen(false);
                }}
            />
        </>
    );
});
const ProgressBox = React.memo(props => {
    const { open, percent, setOpen, setPercent } = props;
    if (!open) return null;
    const RenderProgress = () => {
        if (percent < 100) {
            return (
                <ProgressCircle
                    radius={styles.circle.borderRadius}
                    borderWidth={styles.circle.borderWidth}
                    color={styles.circle.color}
                    shadowColor={styles.circle.shadowColor}
                    bgColor={styles.circle.backgroundColor}
                    percent={percent}>
                    <Text style={styles.progress}>{`${percent}%`}</Text>
                </ProgressCircle>
            );
        } else {
            return <UploadResult setOpen={setOpen} setPercent={setPercent} />;
        }

    };
    return (
        <View style={styles.overlayBox}>
            <TouchableWithoutFeedback
                onPress={() => {
                    setOpen(false);
                }}>
                <View style={styles.popoverback}>
                    <View style={styles.popoverbackInner}></View>
                </View>
            </TouchableWithoutFeedback>

            <View style={styles.popoverroot}>
                <RenderProgress />
            </View>
        </View>
    );
});

const UpLoadControl = (props) => {
    const { item, onPause } = props
    const sheetRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [percent, setPercent] = useState(0);

    const [uploadState, setUploadState] = useState(null)
    const getUploadingState = async () => {
        const data = await AsyncStorage.getItem(item.id)
    }
    useEffect(() => {
        const callBack = (e) => {

            setUploadState(e.state)
            setButtonByState(e.state)
        }
        EventEmitter.addEventListener('storyUpload', callBack)
        return () => {
            EventEmitter.removeListener('storyUpload', callBack)

        }
    }, [])

    const setButtonByState = (state) => {
        const isFail = state === 'fail'
        setButtons([{
            name: "main",
            list: [

                { name: isFail ? "放弃上传" : "删除快拍", func: isFail ? cancelUpload : deleteItem, style: { color: "#FB2E2EFF" } },
                { name: "保存本地", func: saveToLocal, style: {} },
            ],
        }, {
            name: "bottom",
            list: [
                { name: "取消", func: saveToLocal, style: {} },
            ]
        }])
    }

    const cancelUpload = () => {
        // 取消上传
        Alert.alert(
            '取消上传这条快拍',
            [
                {
                    text: I18n.t('Cancel'),
                    style: 'cancel'
                },
                {
                    text: I18n.t('Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await RocketChat.cancelUpload(item.row.id, message.row.rid);
                        } catch (e) {
                            log(e);
                        }
                    }
                }
            ],
            { cancelable: false }
        )
    }
    const deleteItem = () => {
        // 这里删除内容 只有已经发布的才会有删除内容

        sheetRef.current.close();
        Alert.alert(
            '删除这条快拍',
            '',
            [
                {
                    text: I18n.t('Cancel'),
                    style: 'cancel',
                    onPress: () => {
                        onPause(false)

                    }
                },
                {
                    text: I18n.t('Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {

                            logEvent(events.ROOM_MSG_ACTION_DELETE);
                            await RocketChat.deleteMessage(item.row.id, item.row.rid);
                            onPause(false)

                        } catch (e) {
                            onPause(false)

                            logEvent(events.ROOM_MSG_ACTION_DELETE_F);
                            log(e);
                        }
                    }
                }
            ],
            { cancelable: false }
        )
    }
    const close = () => {
        onPause(false)

        sheetRef.current.close();
    }
    const saveToLocal = async () => {
        const result = await request(
            Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        );
        try {
            if (result === RESULTS.GRANTED) {
                const mediaAttachment = item.row.path
                setOpen(true);
                const resumable = FileSystem.createDownloadResumable(mediaAttachment, mediaAttachment, {}, e => {
                    setPercent(parseFloat((e.totalBytesWritten / e.totalBytesExpectedToWrite) * 100).toFixed(2));
                });
                const { uri } = await resumable.downloadAsync(mediaAttachment, file);
                await CameraRoll.save(uri, { album: 'Paiya' });

            } else if (result === RESULTS.BLOCKED) {
                Alert.alert('请先允许App获得访问相册权限', '', [
                    {
                        text: '确定',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                ]);
            }
        } catch (e) {
            console.log(e, '错误信息');
        }


    }
    const openModal = () => {
        onPause(true)
        sheetRef.current.open();
    }
    const tryAgain = async () => {
        const row = item.row
        const { baseUrl: server, selfUser: user } = props;

        try {
            const db = database.active;
            await db.action(async () => {
                await row.update(() => {
                    row.error = false;
                });
            });
            await RocketChat.sendFileMessage(row.rid, row, undefined, server, user);
        } catch (e) {
            log(e);
        }
    }
    const [buttons, setButtons] = useState([{
        name: "main",
        list: [

            { name: "删除快拍", func: deleteItem, style: { color: "#FB2E2EFF" } },
            { name: "保存本地", func: saveToLocal, style: {} },
        ],
    }, {
        name: "bottom",
        list: [
            { name: "取消", func: saveToLocal, style: {} },
        ]
    }])

    const LoadingBlock = () => {
        const isFail = uploadState === 'fail'

        if (uploadState === 'uploading') {
            return (
                <View style={styles.loadingBox}>
                    <Image source={downLoadingGif} style={{ width: 17, height: 17, }} resizeMode={'contain'}
                        containerStyle={{ marginRight: 6 }}
                        placeholderStyle={{ backgroundColor: "trasnparent" }} />
                    <Text style={styles.uploadingText}>上传中...</Text>

                </View>
            )
        }
        return (
            <View style={[styles.dotContainer, isFail ? {
                backgroundColor: "#FF445FFF"
            } : {}]} >
                {
                    isFail ? (
                        <View style={styles.textBox}>
                            <Text style={styles.failText}>上传失败。</Text>
                            <Text style={styles.tryText} onPress={tryAgain}>再试试呗</Text>

                        </View>
                    ) : null
                }

                <Pressable onPress={openModal} style={styles.dotBox}>
                    {[1, 2, 3].map((i) => {
                        return <View style={[styles.dot, isFail ? styles.failDot : {}]}></View>
                    })}
                </Pressable>
            </View>)

    }
    return (
        <View style={styles.root}>
            <LoadingBlock />

            <ProgressBox percent={percent} open={open} setOpen={setOpen} setPercent={setPercent} />

            <RBSheet
                ref={sheetRef}
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
        </View>
    );
};


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
        height: 100,
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
});

export default UpLoadControl;
