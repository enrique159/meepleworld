import 'dart:ui' as ui;

import 'package:flutter/widgets.dart';

/// Superficie de vidrio compartida por los componentes del diseño aprobado.
class GlassContainer extends StatelessWidget {
  const GlassContainer({
    required this.child,
    this.borderRadius = const BorderRadius.all(Radius.circular(24)),
    this.padding = EdgeInsets.zero,
    super.key,
  });

  final Widget child;
  final BorderRadius borderRadius;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      foregroundPainter: _GlassBorderPainter(borderRadius),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: ColoredBox(
            color: const Color.fromRGBO(255, 255, 255, 0.3),
            child: Padding(padding: padding, child: child),
          ),
        ),
      ),
    );
  }
}

class _GlassBorderPainter extends CustomPainter {
  const _GlassBorderPainter(this.borderRadius);

  final BorderRadius borderRadius;

  static const _gradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF1E7FC), Color(0xFFDFC7FE)],
  );

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty) return;

    final bounds = Offset.zero & size;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..shader = _gradient.createShader(bounds);

    // Centrar el trazo dentro de los límites conserva el borde completo de 1 px.
    canvas.drawRRect(borderRadius.toRRect(bounds).deflate(0.5), paint);
  }

  @override
  bool shouldRepaint(_GlassBorderPainter oldDelegate) =>
      borderRadius != oldDelegate.borderRadius;
}
