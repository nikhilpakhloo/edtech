const fs = require("fs");
const path = require("path");
const {
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require("expo/config-plugins");

const registry = require("../src/features/appIcon/appIcon.registry.json");

const MODULE_PACKAGE = "com.anonymous.EdStream.appicon";

function getMainApplication(manifest) {
  const application = manifest.application?.[0];

  if (!application) {
    throw new Error("AndroidManifest.xml is missing an application element.");
  }

  return application;
}

function getMainActivity(manifest) {
  const application = getMainApplication(manifest);
  const activities = application.activity ?? [];

  return activities.find(
    (activity) => activity.$["android:name"] === ".MainActivity",
  );
}

function getLauncherIntentFilter() {
  return {
    action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
    category: [{ $: { "android:name": "android.intent.category.LAUNCHER" } }],
  };
}

function removeMainActivityLauncher(manifest) {
  const mainActivity = getMainActivity(manifest);

  if (!mainActivity?.["intent-filter"]) {
    return;
  }

  mainActivity["intent-filter"] = mainActivity["intent-filter"].filter(
    (intentFilter) => {
      const actions = intentFilter.action ?? [];
      const categories = intentFilter.category ?? [];
      const hasMainAction = actions.some(
        (action) => action.$["android:name"] === "android.intent.action.MAIN",
      );
      const hasLauncherCategory = categories.some(
        (category) =>
          category.$["android:name"] === "android.intent.category.LAUNCHER",
      );

      return !(hasMainAction && hasLauncherCategory);
    },
  );
}

function addLauncherAliases(manifest) {
  const application = getMainApplication(manifest);
  const configuredAliases = new Set(
    registry.map((icon) => icon.androidAliasName),
  );
  const existingAliases = application["activity-alias"] ?? [];

  application["activity-alias"] = existingAliases.filter(
    (alias) => !configuredAliases.has(alias.$["android:name"]),
  );

  for (const icon of registry) {
    application["activity-alias"].push({
      $: {
        "android:name": icon.androidAliasName,
        "android:targetActivity": ".MainActivity",
        "android:exported": "true",
        "android:enabled": icon.defaultEnabled ? "true" : "false",
        "android:icon": icon.androidIconDrawable,
        "android:roundIcon": icon.androidIconDrawable,
        "android:label": "@string/app_name",
      },
      "intent-filter": [getLauncherIntentFilter()],
    });
  }
}

function getDrawableName(resourceName) {
  return resourceName.replace("@drawable/", "");
}

function copyIconAssets(projectRoot) {
  const drawableDir = path.join(
    projectRoot,
    "android",
    "app",
    "src",
    "main",
    "res",
    "drawable",
  );
  fs.mkdirSync(drawableDir, { recursive: true });

  for (const icon of registry) {
    const drawableName = getDrawableName(icon.androidIconDrawable);
    const sourcePath = path.join(projectRoot, icon.androidIconSourceAsset);
    const outputPath = path.join(drawableDir, `${drawableName}.png`);

    fs.copyFileSync(sourcePath, outputPath);
  }
}

function getNativeModuleSource() {
  return `package ${MODULE_PACKAGE};

import android.content.ComponentName;
import android.content.pm.PackageManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

public class EdStreamAppIconModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  public EdStreamAppIconModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @NonNull
  @Override
  public String getName() {
    return "EdStreamAppIcon";
  }

  @ReactMethod
  public void isSupported(Promise promise) {
    promise.resolve(true);
  }

  @ReactMethod
  public void setIcon(String enabledAliasName, ReadableArray allAliasNames, Promise promise) {
    try {
      PackageManager packageManager = reactContext.getPackageManager();

      for (int index = 0; index < allAliasNames.size(); index++) {
        String aliasName = allAliasNames.getString(index);
        if (aliasName == null) {
          continue;
        }

        int state = aliasName.equals(enabledAliasName)
          ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED
          : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;

        packageManager.setComponentEnabledSetting(
          toComponentName(aliasName),
          state,
          PackageManager.DONT_KILL_APP
        );
      }

      promise.resolve(true);
    } catch (Exception exception) {
      promise.reject("ERR_APP_ICON_SWITCH_FAILED", exception);
    }
  }

  private ComponentName toComponentName(String aliasName) {
    String packageName = reactContext.getPackageName();
    String className = aliasName.startsWith(".") ? packageName + aliasName : aliasName;

    return new ComponentName(packageName, className);
  }
}
`;
}

function getNativePackageSource() {
  return `package ${MODULE_PACKAGE};

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EdStreamAppIconPackage implements ReactPackage {
  @NonNull
  @Override
  public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new EdStreamAppIconModule(reactContext));
    return modules;
  }

  @NonNull
  @Override
  public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}
`;
}

function writeNativeModule(projectRoot, androidPackage) {
  const packagePath = path.join(
    projectRoot,
    "android",
    "app",
    "src",
    "main",
    "java",
    ...androidPackage.split("."),
    "appicon",
  );
  fs.mkdirSync(packagePath, { recursive: true });
  fs.writeFileSync(
    path.join(packagePath, "EdStreamAppIconModule.java"),
    getNativeModuleSource(),
  );
  fs.writeFileSync(
    path.join(packagePath, "EdStreamAppIconPackage.java"),
    getNativePackageSource(),
  );
}

function addManualPackage(mainApplication) {
  let contents = mainApplication.modResults.contents;

  if (
    !contents.includes(
      "import com.anonymous.EdStream.appicon.EdStreamAppIconPackage",
    )
  ) {
    contents = contents.replace(
      "import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint\n",
      "import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint\nimport com.anonymous.EdStream.appicon.EdStreamAppIconPackage\n",
    );
  }

  if (!contents.includes("add(EdStreamAppIconPackage())")) {
    contents = contents.replace(
      "// add(MyReactNativePackage())",
      "// add(MyReactNativePackage())\n          add(EdStreamAppIconPackage())",
    );
  }

  mainApplication.modResults.contents = contents;
  return mainApplication;
}

module.exports = function withAndroidDynamicAppIcons(config) {
  config = withAndroidManifest(config, (manifestConfig) => {
    removeMainActivityLauncher(manifestConfig.modResults.manifest);
    addLauncherAliases(manifestConfig.modResults.manifest);
    return manifestConfig;
  });

  config = withMainApplication(config, addManualPackage);

  config = withDangerousMod(config, [
    "android",
    (dangerousConfig) => {
      const packageName =
        dangerousConfig.android?.package ?? dangerousConfig.android?.packageName;

      copyIconAssets(dangerousConfig.modRequest.projectRoot);
      writeNativeModule(dangerousConfig.modRequest.projectRoot, packageName);

      return dangerousConfig;
    },
  ]);

  return config;
};
