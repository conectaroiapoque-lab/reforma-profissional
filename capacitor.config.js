const app=require("./config/app-config");

/** Capacitor shares the same compiled web application across Android and iOS. */
module.exports={appId:app.iosBundleId,appName:app.appName,webDir:"dist",server:{androidScheme:"https",iosScheme:"https"},ios:{contentInset:"automatic",preferredContentMode:"mobile"}};
