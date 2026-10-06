import 'package:flutter/widgets.dart';

import '../styles/glass_border_style.dart';
import 'glass_container.dart';

/// Botón de cápsula que reutiliza la superficie de vidrio del menú inferior.
class GlassButton extends StatelessWidget {
  const GlassButton({
    required this.semanticLabel,
    required this.child,
    this.onPressed,
    this.height = 56,
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
    this.borderStyle = GlassBorderStyle.lightBackground,
    super.key,
  });

  final String semanticLabel;
  final Widget child;
  final VoidCallback? onPressed;
  final double height;
  final EdgeInsetsGeometry padding;
  final GlassBorderStyle borderStyle;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      enabled: onPressed != null,
      label: semanticLabel,
      onTap: onPressed,
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: onPressed,
        child: GlassContainer(
          borderRadius: BorderRadius.circular(999),
          padding: padding,
          borderStyle: borderStyle,
          child: SizedBox(
            height: height,
            child: Center(widthFactor: 1, child: child),
          ),
        ),
      ),
    );
  }
}
