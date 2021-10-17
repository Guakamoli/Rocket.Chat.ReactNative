/* eslint-disable react/no-unused-prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View, Pressable, PermissionsAndroid, Text, TouchableWithoutFeedback, Alert, Platform } from 'react-native';
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
import { formatAttachmentUrl } from '../../../../../lib/utils.js';
import SHA256 from 'js-sha256';
import * as mime from 'react-native-mime-types';
import RNFetchBlob from 'rn-fetch-blob';
import database from '../../../../../lib/database';

import { FileSystem } from 'react-native-unimodules';
const { width, height } = Dimensions.get("window")
const { downLoadingGif, successPng } = ImageMap

const UploadResult = React.memo((props) => {
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
            <Text style={styles.statusText}>{I18n.t('saved_to_gallery')}</Text>
            <Button
                buttonStyle={styles.reuploadButton}
                title={'确定'}
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
    if (!open && !percent) return null;
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

const UpLoadControl = React.memo((props) => {
    const { item, onPause, stories, index } = props

    const sheetRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [percent, setPercent] = useState(0);
    const pauseSelfControlRef = useRef(false)
    const [uploadState, setUploadState] = useState(null)
    const getUploadingState = async () => {
        const data = await AsyncStorage.getItem(item.id)
    }
    useEffect(() => {
        setButtonByState()
    }, [item])

    const setButtonByState = () => {
        const isFail = item.row.error
        setButtons([{
            name: "main",
            list: [

                { name: isFail ? "放弃上传" : "删除快拍", func: isFail ? cancelUpload : deleteItem, style: { color: "#FB2E2EFF" } },
                { name: "保存本地", func: saveToLocal, style: {} },
            ],
        }, {
            name: "bottom",
            list: [
                { name: "取消", func: close, style: {} },
            ]
        }])
    }

    const cancelUpload = () => {
        // 取消上传
        pauseSelfControlRef.current = true
        sheetRef.current.close();
        Alert.alert(
            '取消上传这条快拍',
            '',
            [
                {
                    text: I18n.t('Cancel'),
                    style: 'cancel',
                    onPress: () => {
                        onPause(false)
                        pauseSelfControlRef.current = false
                    }
                },
                {
                    text: I18n.t('Confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.info("指向性了 ", item)
                            pauseSelfControlRef.current = false

                            await RocketChat.cancelUpload(item.row);


                        } catch (e) {
                            pauseSelfControlRef.current = false
                            onPause(false)

                            log(e);

                            console.info(e, '取消错误')
                        }
                    }
                }
            ],
            { cancelable: true }
        )

    }
    const deleteItem = () => {
        // 这里删除内容 只有已经发布的才会有删除内容
        pauseSelfControlRef.current = true

        sheetRef.current.close();
        Alert.alert(
            '删除这条快拍',
            '',
            [
                {
                    text: I18n.t('Cancel'),
                    style: 'cancel',
                    onPress: () => {
                        pauseSelfControlRef.current = true

                        onPause(false)

                    }
                },
                {
                    text: I18n.t('Delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            pauseSelfControlRef.current = false

                            logEvent(events.ROOM_MSG_ACTION_DELETE);
                            await RocketChat.deleteMessage(item.row.id, item.row.rid);
                            onPause(false)

                        } catch (e) {
                            onPause(false)
                            pauseSelfControlRef.current = false

                            logEvent(events.ROOM_MSG_ACTION_DELETE_F);
                            log(e);
                        }
                    }
                }
            ],
            { cancelable: true }
        )
    }
    const close = () => {
        if (!pauseSelfControlRef.current) {
            onPause(false)

        }

        sheetRef.current.close();
    }
    const saveToLocal = async () => {
        pauseSelfControlRef.current = true
        try {
            const { baseUrl, selfUser: user } = props;
            let url = item.row.path
            const image_type = item.row?.attachments?.[0]?.image_type
            const video_type = item.row?.attachments?.[0]?.video_type

            if (!url) {

                url = item.row.attachments[0].video_url || item.row.attachments[0].image_url
                if (url) {

                    url = formatAttachmentUrl(url, user.id, user.token, baseUrl);

                }
            }

            const mediaAttachment = formatAttachmentUrl(url, user.id, user.token, baseUrl);

            if (Platform.OS !== 'ios') {
                const rationale = {
                    title: I18n.t('Write_External_Permission'),
                    message: I18n.t('Write_External_Permission_Message')
                };
                const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, rationale);
                if (!(result || result === PermissionsAndroid.RESULTS.GRANTED)) {
                    return;
                }
            }
            setOpen(true);

            sheetRef.current.close();
            const extension = image_type ? `.${mime.extension(image_type) || 'jpg'}` : `.${mime.extension(video_type) || 'mp4'}`;
            const documentDir = `${RNFetchBlob.fs.dirs.DocumentDir}/`;
            const path = `${documentDir + SHA256(url) + extension}`;
            const file = await RNFetchBlob.config({ path }).fetch('GET', mediaAttachment).progress((received, total) => {
                setPercent(parseFloat((received / total) * 100).toFixed(2));

            }).then((resp) => {
                // ...
                setPercent(100);

            });
            await CameraRoll.save(path, { album: 'Rocket.Chat' });
            await file.flush();
            pauseSelfControlRef.current = false
            onPause(false)

        } catch (e) {
            pauseSelfControlRef.current = false
            onPause(false)

            console.info(e, '错误信息');
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
            console.info('重试错误', e)
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
            { name: "取消", func: close, style: {} },
        ]
    }])

    const LoadingBlock = () => {
        if (item.row.error === false) {
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
            <View style={[styles.dotContainer, item.row.error ? {
                backgroundColor: "#FF445FFF"
            } : {}]} >
                {
                    item.row.error ? (
                        <View style={styles.textBox}>
                            <Text style={styles.failText}>上传失败。</Text>
                            <Text style={styles.tryText} onPress={tryAgain}>再试试呗</Text>

                        </View>
                    ) : null
                }

                <Pressable onPress={openModal} style={styles.dotBox}>
                    {[1, 2, 3].map((i) => {
                        return <View style={[styles.dot, item.row.error ? styles.failDot : {}]}></View>
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
});


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

export default UpLoadControl;
