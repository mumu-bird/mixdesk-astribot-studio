import Foundation
import CoreGraphics
let args=CommandLine.arguments
let point=CGPoint(x: Double(args[1])!, y: Double(args[2])!)
for type in [CGEventType.mouseMoved, .leftMouseDown, .leftMouseUp] {
  CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: point, mouseButton: .left)?.post(tap: .cghidEventTap)
  Thread.sleep(forTimeInterval: 0.08)
}
