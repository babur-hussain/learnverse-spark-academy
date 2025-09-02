import UIKit

class StatusBarManager: NSObject {
    static let shared = StatusBarManager()
    
    private override init() {
        super.init()
    }
    
    func hideStatusBar() {
        if #available(iOS 13.0, *) {
            // Use modern iOS 13+ approach
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                windowScene.statusBarManager?.isStatusBarHidden = true
            }
        } else {
            // Fallback for older iOS versions
            UIApplication.shared.isStatusBarHidden = true
        }
    }
    
    func showStatusBar() {
        if #available(iOS 13.0, *) {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                windowScene.statusBarManager?.isStatusBarHidden = false
            }
        } else {
            UIApplication.shared.isStatusBarHidden = false
        }
    }
    
    func setStatusBarStyle(_ style: UIStatusBarStyle) {
        if #available(iOS 13.0, *) {
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                windowScene.statusBarManager?.statusBarStyle = style
            }
        } else {
            UIApplication.shared.statusBarStyle = style
        }
    }
}
