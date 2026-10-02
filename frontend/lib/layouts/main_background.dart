import 'dart:math' as math;

import 'package:flutter/widgets.dart';

class MainBackground extends StatelessWidget {
  const MainBackground({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.topRight,
          radius: 1,
          colors: [Color(0xFFDFC6FE), Color(0xFFF3E6EF)],
          stops: [0, 1],
          transform: _MainBackgroundTransform(),
        ),
      ),
      child: SizedBox.expand(child: child),
    );
  }
}

class _MainBackgroundTransform extends GradientTransform {
  const _MainBackgroundTransform();

  @override
  Matrix4 transform(Rect bounds, {TextDirection? textDirection}) {
    if (bounds.isEmpty) {
      return Matrix4.identity();
    }

    final center = bounds.topRight;
    final diagonal = math.sqrt(
      bounds.width * bounds.width + bounds.height * bounds.height,
    );
    final scale = diagonal / bounds.shortestSide;

    // El eje mayor une las esquinas superior derecha e inferior izquierda.
    // La proporción 2:1 aproxima la elipse de la referencia y escala con el layout.
    return Matrix4.identity()
      ..translateByDouble(center.dx, center.dy, 0, 1)
      ..rotateZ(math.atan2(bounds.height, -bounds.width))
      ..scaleByDouble(scale, scale / 2, 1, 1)
      ..translateByDouble(-center.dx, -center.dy, 0, 1);
  }
}
