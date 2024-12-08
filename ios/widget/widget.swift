import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), text: "Placeholder")
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        let entry = SimpleEntry(date: Date(), text: "Snapshot")
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        let text = getItem()
        let entry = SimpleEntry(date: Date(), text: text)
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
    
    private func getItem() -> String {
        let userDefaults = UserDefaults(suiteName: "group.com.paulg129.spendy.widget")
        return userDefaults?.string(forKey: "savedData") ?? ""
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let text: String
}

struct widgetEntryView: View {
    var entry: Provider.Entry
    
    var body: some View {
        ZStack {
            // Full-screen background with gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.green, Color.blue]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea() // Ensure no padding exists
            Text("Spent:")
            // Content on top of gradient
            Text(entry.text)
                .foregroundColor(.white)
                .font(.headline)
                .multilineTextAlignment(.center)
                .padding()
        }
        .clipShape(ContainerRelativeShape()) // Matches widget shape
    }
}

@main
struct widget: Widget {
    let kind: String = "widget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
        }
        .configurationDisplayName("Widget name")
        .description("Widget description")
        .supportedFamilies([.systemSmall])
    }
}

struct widget_Previews: PreviewProvider {
    static var previews: some View {
        widgetEntryView(entry: SimpleEntry(date: Date(), text: "Preview"))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
