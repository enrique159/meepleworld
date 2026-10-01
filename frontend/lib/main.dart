import 'package:flutter/widgets.dart';

void main() {
  runApp(const MeepleWorldApp());
}

class MeepleWorldApp extends StatelessWidget {
  const MeepleWorldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return WidgetsApp(
      title: 'MeepleWorld',
      color: const Color(0xFFFFFFFF),
      debugShowCheckedModeBanner: false,
      builder: (context, child) =>
          const ColoredBox(color: Color(0xFFFFFFFF), child: SizedBox.expand()),
    );
  }
}
