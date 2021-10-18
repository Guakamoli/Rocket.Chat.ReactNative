
/* eslint-disable react/no-unused-prop-types */
import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import I18n from '../../../../i18n';
import RocketChat from '../../../../lib/rocketchat';
import RBSheetBase from "./RBSheetBase";


const RBSheetModal = React.memo(React.forwardRef((props) => {
    const { navigation } = props
    const sheetRef = useRef(null)
    const itemRef = useRef(null)

    const close = () => {
        sheetRef.current.close()
    }
    const deleteItem = () => {
        // 
        Alert.alert(
            '删除该作品',
            '',
            [
                {
                    text: I18n.t('Cancel'),
                    style: 'cancel',
                    onPress: () => {
                    }
                },
                {
                    text: I18n.t('Confirm'),
                    style: 'destructive',
                    onPress: async () => {
                        const item = itemRef.current
                        try {
                            await RocketChat.deleteMessage(item.id, item.rid);
                        } catch (e) {

                            console.info(e, '删除错误')
                        }
                    }
                }
            ],
            { cancelable: true }
        )

    }
    const editItem = () => {
        navigation.navigate("FeedsEditPost", { item: itemRef.current })

    }
    const [buttons] = useState([{
        name: "main",
        list: [

            { name: "删除", func: deleteItem, style: { color: "#FF3350FF" } },
            { name: "编辑", func: editItem, style: {} },
        ],
    }, {
        name: "bottom",
        list: [
            { name: "取消", func: close, style: {} },
        ]
    }])
    const openEditModal = (item) => {
        // 负责展示
        itemRef.current = item
        sheetRef.current?.show?.()
    }
    return (
        <RBSheetBase buttons={buttons} sheetRef={sheetRef} />
    )
}))

export default RBSheetModal