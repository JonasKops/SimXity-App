import React from 'react';
import {Dimensions, View} from 'react-native';
import IframeRenderer, {iframeModel} from '@native-html/iframe-plugin';
import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html';
import WebView from 'react-native-webview';

const renderers = {
  iframe: props => (
    <View renderToHardwareTextureAndroid={true}>
      <IframeRenderer {...props} />
    </View>
  ),
};

const customHTMLElementModels = {
  iframe: iframeModel,
  center: HTMLElementModel.fromCustomModel({
    tagName: 'center',
    contentModel: HTMLContentModel.block,
  }),
};

const RenderDataHTML = React.memo(function RenderDataHTML({html, style = {}}) {
  return (
    <RenderHTML
      systemFonts={[
        'Poppins',
        'Poppins-ExtraLight',
        'Poppins-Light',
        'Poppins-Medium',
        'Poppins-SemiBold',
        'Poppins-Bold',
        'Poppins-ExtraBold',
      ]}
      source={{
        html: html || '',
      }}
      tagsStyles={{
        body: {
          fontFamily: 'Poppins',
          fontSize: 13,
          color: '#374151',
          ...style,
        },
      }}
      enableExperimentalMarginCollapsing
      renderers={renderers}
      WebView={WebView}
      contentWidth={Dimensions.get('window').width - 32}
      customHTMLElementModels={customHTMLElementModels}
      renderersProps={{
        img: {
          enableExperimentalPercentWidth: true,
        },
      }}
    />
  );
});

export default RenderDataHTML;
