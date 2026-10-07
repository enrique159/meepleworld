import 'dart:ui' as ui;

import 'package:flutter/widgets.dart';

import '../styles/glass_border_style.dart';

/// Superficie de vidrio compartida por los componentes del diseño aprobado.
class GlassContainer extends StatelessWidget {
  const GlassContainer({
    required this.child,
    this.borderRadius = const BorderRadius.all(Radius.circular(24)),
    this.padding = EdgeInsets.zero,
    this.borderStyle = GlassBorderStyle.lightBackground,
    this.backgroundColor = const Color.fromRGBO(255, 255, 255, 0.3),
    super.key,
  });

  final Widget child;
  final BorderRadius borderRadius;
  final EdgeInsetsGeometry padding;
  final GlassBorderStyle? borderStyle;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      foregroundPainter: borderStyle == null
          ? null
          : _GlassBorderPainter(borderRadius, borderStyle!),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: BackdropFilter(
          filter: ui.ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: ColoredBox(
            color: backgroundColor,
            child: Padding(padding: padding, child: child),
          ),
        ),
      ),
    );
  }
}

class _GlassBorderPainter extends CustomPainter {
  const _GlassBorderPainter(this.borderRadius, this.borderStyle);

  final BorderRadius borderRadius;
  final GlassBorderStyle borderStyle;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty) return;

    final bounds = Offset.zero & size;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..shader = borderStyle.gradient.createShader(bounds);

    // Centrar el trazo dentro de los límites conserva el borde completo de 1 px.
    canvas.drawRRect(borderRadius.toRRect(bounds).deflate(0.5), paint);
  }

  @override
  bool shouldRepaint(_GlassBorderPainter oldDelegate) =>
      borderRadius != oldDelegate.borderRadius ||
      borderStyle != oldDelegate.borderStyle;
}
