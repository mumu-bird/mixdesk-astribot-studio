import Foundation
import CoreGraphics
let windows = CGWindowListCopyWindowInfo([.optionAll], kCGNullWindowID) as? [[String: Any]] ?? []
for w in windows where (w[kCGWindowOwnerName as String] as? String) == "DJUCED" {
  print(w)
}
