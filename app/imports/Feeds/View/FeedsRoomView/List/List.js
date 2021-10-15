import React from 'react';
import { FlatList, StyleSheet, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import PropTypes from 'prop-types';

import { isIOS } from '../../../../../utils/deviceInfo';
import scrollPersistTaps from '../../../../../utils/scrollPersistTaps';
import { Handle } from "../../../../../containers/ActionSheet/Handle"
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
const { height: windowHeight } = Dimensions.get("window")

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const styles = StyleSheet.create({
	list: {
		flex: 1,
		// backgroundColor: "blue"
	},
	contentContainer: {
		paddingBottom: 150,
		// backgroundColor: "red"
	}
});

const List = ({ listRef, mode, theme, nochild, ...props }) => {
	if (mode && !nochild) {
		return null
		// return (
		// 	<ScrollBottomSheet
		// 		componentType="FlatList"
		// 		snapPoints={[128, '50%', windowHeight - 400]}
		// 		initialSnapIndex={2}
		// 		renderHandle={() => (
		// 			<Handle theme={theme}></Handle>
		// 		)}

		// 		keyExtractor={i => i}
		// 		{...props}
		// 		{...scrollPersistTaps}
		// 		style={{ backgroundColor: "white", flex: 1 }}
		// 		containerStyle={{ backgroundColor: "white", paddingBottom: 150, }}
		// 	/>
		// )
	}
	return <AnimatedFlatList
		testID='room-view-messages'
		ref={listRef}
		keyExtractor={item => item.id}
		contentContainerStyle={styles.contentContainer}
		style={styles.list}
		removeClippedSubviews={isIOS}
		initialNumToRender={20}
		onEndReachedThreshold={0.5}
		maxToRenderPerBatch={10}
		windowSize={10}
		{...props}
		{...scrollPersistTaps}
	/>
};

List.propTypes = {
	listRef: PropTypes.object
};

export default List;
