import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
	image: {
		width: '100%',
		height: '100%',
		position: 'absolute'
	},
	textBox: {
		marginTop: 20,
		alignItems: "center"
	},
	text: {
		color: "#818181FF",
		fontSize: 15,
		lineHeight: 17,
		fontWeight: "500"
	},
});

const EmptyRoom = React.memo(({
	length, mounted, theme, rid
}) => {
	if ((length === 0 && mounted) || !rid) {
		return (
			<View style={styles.textBox}>
				{/* <Text style={styles.text}>暂无评论</Text> */}
			</View>
		);
	}
	return null;
});

EmptyRoom.propTypes = {
	length: PropTypes.number.isRequired,
	mounted: PropTypes.bool,
	theme: PropTypes.string,
	rid: PropTypes.string
};
export default EmptyRoom;
