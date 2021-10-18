import React, { Component } from 'react';
import {
	View, Text, StyleSheet, TouchableOpacity, ScrollView,
	Image as RNIMage
} from 'react-native';
import PropTypes from 'prop-types';
import { Q } from '@nozbe/watermelondb';

import database from '../../../../lib/database';
import RocketChat from '../../../../lib/rocketchat';
import log from '../../../../utils/log';
import I18n from '../../../../i18n';
import { CustomIcon } from '../../../../lib/Icons';
import { themes } from '../../../../constants/colors';
import { withTheme } from '../../../../theme';
import ImageMap from "../../images"
import Video from 'react-native-video';
import { Image, } from 'react-native-elements';

const { selectedPng, imageTypeIconPng, videoTypeIconPng, closeSmallPng, reUploadPng, closeUploadPng } = ImageMap

const TypeIcon = (props) => {
	const { isVideo, item } = props
	const videoPorps = {
		objectFit: 'cover',
		source: { uri: item.path },
		resizeMode: 'cover',
		controls: false,
		loop: false,
		autoplay: false,
		repeat: true,
		paused: true,
		muted: true,
		bufferConfig: {
			minBufferMs: 1000,
			maxBufferMs: 2000,
			bufferForPlaybackMs: 500,
			bufferForPlaybackAfterRebufferMs: 500,
		},
	};
	return (
		<View style={styles.prevImageWrapper}>
			{isVideo ? (
				<>
					<Video {...videoPorps} style={styles.prevImage} />
					<Image source={videoTypeIconPng}
						containerStyle={styles.videoDecoImage}
						style={{ width: "100%", height: "100%" }} resizeMode={'contain'} />
				</>
			) : (
					<>
						<Image source={{ uri: item.path }} style={styles.prevImage} />

						<Image source={imageTypeIconPng}
							containerStyle={styles.imageDecoImage}
							style={{ width: "100%", height: "100%" }} resizeMode={'contain'} />
					</>
				)}

		</View>
	)
}
class UploadProgress extends Component {
	static propTypes = {
		width: PropTypes.number,
		rid: PropTypes.string,
		theme: PropTypes.string,
		user: PropTypes.shape({
			id: PropTypes.string.isRequired,
			username: PropTypes.string.isRequired,
			token: PropTypes.string.isRequired
		}),
		baseUrl: PropTypes.string.isRequired
	}

	constructor(props) {
		super(props);
		this.mounted = false;
		this.ranInitialUploadCheck = false;
		this.state = {
			uploads: []
		};
		this.init();
	}

	componentDidMount() {
		this.mounted = true;
	}

	componentWillUnmount() {
		if (this.uploadsSubscription && this.uploadsSubscription.unsubscribe) {
			this.uploadsSubscription.unsubscribe();
		}
	}

	init = () => {
		const { rid } = this.props;
		if (!rid) { return; }

		const db = database.active;
		this.uploadsObservable = db.collections
			.get('uploads')
			.query(
				Q.where('rid', rid),
				Q.where('description', Q.like(`%paiyapost%`)),
				Q.experimentalTake(1)

			)

			.observeWithColumns(['progress', 'error']);

		this.uploadsSubscription = this.uploadsObservable
			.subscribe((uploads) => {
				console.info(uploads, 'uploadsuploadsuploads')
				if (this.mounted) {
					this.setState({ uploads });
				} else {
					this.state.uploads = uploads;
				}
				if (!this.ranInitialUploadCheck) {
					this.uploadCheck();
				}
			});
	}

	uploadCheck = () => {
		this.ranInitialUploadCheck = true;
		const { uploads } = this.state;
		uploads.forEach(async (u) => {
			if (!RocketChat.isUploadActive(u.path)) {
				try {
					const db = database.active;
					await db.action(async () => {
						await u.update(() => {
							u.error = true;
						});
					});
				} catch (e) {
					log(e);
				}
			}
		});
	}

	deleteUpload = async (item) => {
		try {
			const db = database.active;
			await db.action(async () => {
				await item.destroyPermanently();
			});
		} catch (e) {
			log(e);
		}
	}

	cancelUpload = async (item) => {
		try {
			await RocketChat.cancelUpload(item);
		} catch (e) {
			log(e);
		}
	}

	tryAgain = async (item) => {
		const { rid, baseUrl: server, user } = this.props;

		try {
			const db = database.active;
			await db.action(async () => {
				await item.update(() => {
					item.error = false;
				});
			});
			await RocketChat.sendFileMessage(rid, item, undefined, server, user);
		} catch (e) {
			log(e);
		}
	}

	renderItemContent = (item) => {
		const { width, theme } = this.props;
		const isVideo = item.type.includes('video')
		if (!item.error) {
			return (
				<>
					<View key='row' style={styles.row}>
						<TypeIcon isVideo={isVideo} item={item} />
						<Text style={[styles.descriptionContainer, styles.descriptionText, { color: themes[theme].auxiliaryText }]} numberOfLines={1}>
							{I18n.t('Uploading')} {item.name}
						</Text>
						<CustomIcon name='close' size={20} color={themes[theme].auxiliaryText} onPress={() => this.cancelUpload(item)} />
					</View>
					<View key='progress' style={[styles.progress, { width: "100%", backgroundColor: '#836BFF78', zIndex: 0 }]} />
					<View key='progress' style={[styles.progress, { width: (width * item.progress) / 100, backgroundColor: '#836BFFFF', zIndex: 1 }]} />
				</>
			);
		}
		return (
			<>
				<View style={styles.row}>
					<TypeIcon isVideo={isVideo} item={item} />
					<View style={styles.descriptionContainer}>
						<Text style={[styles.descriptionText, { color: themes[theme].auxiliaryText }]} numberOfLines={1}>{'我们会在网络信号改善时重试。'}</Text>
						{/* <TouchableOpacity onPress={() => this.tryAgain(item)}>
							<Text style={[styles.tryAgainButtonText, { color: themes[theme].tintColor }]}>{I18n.t('Try_again')}</Text>
						</TouchableOpacity> */}
					</View>
					<Image source={reUploadPng} style={{ width: 18, height: 18, marginRight: 23 }} onPress={() => this.tryAgain(item)} />

					<Image source={closeUploadPng} style={{ width: 16, height: 16 }} onPress={() => this.deleteUpload(item)} />
					{/* <CustomIcon name='close' size={20} color={themes[theme].auxiliaryText} onPress={() => this.deleteUpload(item)} /> */}
				</View>
				<View key='progress' style={[styles.progress, { width: "100%", backgroundColor: '#FF3450FF', zIndex: 0 }]} />
			</>
		);
	}

	// TODO: transform into stateless and update based on its own observable changes
	renderItem = (item, index) => {
		const { theme } = this.props;

		return (
			<View
				key={item.path}
				style={[
					styles.item,
					index !== 0 ? { marginTop: 10 } : {},
					{
						backgroundColor: "white",
						borderColor: themes[theme].borderColor
					}
				]}
			>
				{this.renderItemContent(item)}
			</View>
		);
	}

	render() {
		const { uploads } = this.state;
		return (
			<ScrollView style={styles.container}>
				{uploads.map((item, i) => this.renderItem(item, i))}
			</ScrollView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		top: 0,
		width: '100%',
		maxHeight: 246
	},
	item: {
		height: 54,
		borderBottomWidth: StyleSheet.hairlineWidth,
		justifyContent: 'center',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
	},
	descriptionContainer: {
		flexDirection: 'column',
		flex: 1,
		marginLeft: 10
	},
	descriptionText: {
		fontSize: 16,
		lineHeight: 20,
	},
	progress: {
		position: 'absolute',
		width: "100%",
		bottom: 0,
		height: 3.5
	},
	tryAgainButtonText: {
		fontSize: 16,
		lineHeight: 20,
	},
	prevImageWrapper: {
		marginRight: 12,
		justifyContent: "center",
		alignItems: "center"
	},
	prevImage: {
		width: 30,
		height: 30,
		zIndex: 1,
	},
	videoDecoImage: {
		width: 12,
		height: 14,
		position: "absolute",
		zIndex: 11
	},
	imageDecoImage: {
		width: 5,
		height: 5,
		position: "absolute",
		top: 0,
		right: 0,
		zIndex: 10,

	},
});
export default withTheme(UploadProgress);
