import 'package:flutter/widgets.dart';

enum GlassBorderStyle {
  lightBackground(
    LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [Color(0xFFF1E7FC), Color(0xFFDFC7FE)],
    ),
  ),
  coloredBackground(
    LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [Color(0xFFF1E7FC), Color(0xFF7676C3)],
    ),
  );

  const GlassBorderStyle(this.gradient);

  final LinearGradient gradient;
}
