import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import I18n from '../../../../../i18n';

const { width: innerWidth } = Dimensions.get('window');
const MoreLessComponent = ({ t, truncatedText, fullText, style, dataSet, showMoreBtn }) => {
  const [more, setMore] = React.useState(false);

  if (!showMoreBtn) {
    return (
      <View>
        <Text style={style} dataSet={dataSet}>
          {fullText}
        </Text>
      </View>
    );
  }
  return (
    <Text style={[style]} dataSet={dataSet}>
      {!more ? `${truncatedText}` : fullText}
      {!more ? <Text>... </Text> : null}
      <Text onPress={() => setMore(!more)} style={[{ color: 'rgba(125, 139, 202, 1)' }]}>
        {more ? t('putAway') : t('unfold')}
      </Text>
    </Text>
  );
};

const MoreLessTruncated = React.memo(props => {
  const { text, linesToTruncate = 1, style, dataSet } = props;
  const [clippedText, setClippedText] = React.useState(false);
  const [showMoreBtn, setShowMoreBtn] = React.useState(false);
  const clculateLineNum = linesToTruncate + 1;
  const { t } = I18n;
  return clippedText ? (
    <MoreLessComponent
      truncatedText={clippedText}
      fullText={text}
      t={t}
      style={style}
      dataSet={dataSet}
      showMoreBtn={showMoreBtn}
    />
  ) : (
      <View>
        <Text
          numberOfLines={clculateLineNum}
          ellipsizeMode={'tail'}
          style={style}
          dataSet={dataSet}
          onTextLayout={event => {
            // 处理方法。多加一行,然后用上一行的内容减去6个字符
            const { lines } = event.nativeEvent;
            if (!lines[0]) {
              return setClippedText('');
            }
            if (lines[linesToTruncate]?.text) {
              setShowMoreBtn(true);
            }
            let turncateNum = 5;
            const preLineIndex = linesToTruncate - 1;
            if (lines[preLineIndex] && lines[preLineIndex].width < innerWidth - 60 - 60) {
              turncateNum = 0;
            }
            let text = lines
              .splice(0, linesToTruncate)
              .map((line, index) => {
                if (index < linesToTruncate) {
                  if (index === linesToTruncate - 1) {
                    return line.text.replace('\n', '');
                  }
                  return line.text;
                }
                return '';
              })
              .join('');

            setClippedText(text.substr(0, text.length - turncateNum));
          }}>
          {text}
        </Text>
      </View>
    );
});
let styles = StyleSheet.create({});
export default MoreLessTruncated;
