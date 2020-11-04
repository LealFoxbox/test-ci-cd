package com.orangeqc.app;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "OrangeQC";
  }

  @Override
  protected void onCreate(Bundle savedInstance) {
    // we don't pass savedInstance to onCreate because the app was crashing
    // when the user changed permissions after having accepted them and opening the app back up again
    // https://github.com/software-mansion/react-native-screens/issues/17
    super.onCreate(null);
    RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);
  }
}
