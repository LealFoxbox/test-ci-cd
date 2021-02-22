/* eslint-disable react-native/no-color-literals */
/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  onRequestClose: () => void;
};

const HIT_SLOP = { top: 16, left: 16, bottom: 16, right: 16 };

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-end',
  },
  closeButton: {
    marginRight: 8,
    marginTop: 8,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22.5,
    backgroundColor: '#00000077',
  },
  closeText: {
    lineHeight: 25,
    fontSize: 25,
    paddingTop: 2,
    textAlign: 'center',
    color: '#FFF',
    includeFontPadding: false,
  },
});

const ImageDefaultHeader = ({ onRequestClose }: Props) => (
  <SafeAreaView style={styles.root}>
    <TouchableOpacity accessibilityRole="button" style={styles.closeButton} onPress={onRequestClose} hitSlop={HIT_SLOP}>
      <Text style={styles.closeText}>✕</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

export default ImageDefaultHeader;
