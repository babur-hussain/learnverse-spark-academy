package com.learnverse.sparkacademy;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import android.graphics.Color;
import android.view.WindowManager;
import android.view.View;
import androidx.core.view.ViewCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Ensure the app does not draw behind the status bar
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        // Make the status bar opaque and ensure content is below it
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS
                | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        // Status bar color will be set by the StatusBar plugin from web layer
        // getWindow().setStatusBarColor(Color.WHITE);
        View decor = getWindow().getDecorView();
        if (decor != null) {
            decor.setSystemUiVisibility(0);
            ViewCompat.setOnApplyWindowInsetsListener(decor, (v, insets) -> {
                // Force padding to respect status bar
                v.setPadding(0, insets.getSystemWindowInsetTop(), 0, 0);
                return insets;
            });
        }
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setFitsSystemWindows(true);
            getBridge().getWebView().setPadding(0, 48, 0, 0); // Force 48px top padding
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setFitsSystemWindows(true);
        }
    }
}
