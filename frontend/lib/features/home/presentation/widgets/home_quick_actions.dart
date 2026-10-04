import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'package:hugeicons/hugeicons.dart';

import 'home_quick_action_card.dart';

/// Accesos visuales; sus flujos se conectarán cuando tengan diseño autorizado.
class HomeQuickActions extends StatelessWidget {
  const HomeQuickActions({
    this.onCreateTablePressed,
    this.onMapPressed,
    this.onLibraryPressed,
    this.onFriendsPressed,
    this.onMarketplacePressed,
    super.key,
  });

  final VoidCallback? onCreateTablePressed;
  final VoidCallback? onMapPressed;
  final VoidCallback? onLibraryPressed;
  final VoidCallback? onFriendsPressed;
  final VoidCallback? onMarketplacePressed;

  static const _gap = 12.0;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // El primer frame móvil puede llegar antes que el tamaño de la pantalla.
        if (constraints.maxWidth <= _gap) {
          return const SizedBox.shrink();
        }

        final cardWidth = (constraints.maxWidth - _gap) / 2;
        final cardHeight = _cardHeight(context, cardWidth);

        return Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: cardWidth,
                  height: cardHeight * 2 + _gap,
                  child: HomeQuickActionCard(
                    label: 'Crear mesa',
                    icon: HugeIcons.strokeRoundedPlus,
                    color: const Color(0xFF754887),
                    backgroundImage:
                        'assets/images/create_table_background.jpg',
                    onPressed: onCreateTablePressed,
                  ),
                ),
                const SizedBox(width: _gap),
                SizedBox(
                  width: cardWidth,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(
                        height: cardHeight,
                        child: HomeQuickActionCard(
                          label: 'Ver mapa',
                          icon: HugeIcons.strokeRoundedMapsLocation02,
                          color: const Color(0xFFEEB85F),
                          onPressed: onMapPressed,
                        ),
                      ),
                      const SizedBox(height: _gap),
                      SizedBox(
                        height: cardHeight,
                        child: HomeQuickActionCard(
                          label: 'Mi ludoteca',
                          icon: HugeIcons.strokeRoundedDice,
                          color: const Color(0xFF8FB2EC),
                          onPressed: onLibraryPressed,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: _gap),
            SizedBox(
              height: cardHeight,
              child: Row(
                children: [
                  Expanded(
                    child: HomeQuickActionCard(
                      label: 'Mis amigos',
                      icon: HugeIcons.strokeRoundedAiCoEditing,
                      color: const Color(0xFFEC8DBD),
                      onPressed: onFriendsPressed,
                    ),
                  ),
                  const SizedBox(width: _gap),
                  Expanded(
                    child: HomeQuickActionCard(
                      label: 'Marketplace',
                      icon: HugeIcons.strokeRoundedStore01,
                      color: const Color(0xFF9590ED),
                      onPressed: onMarketplacePressed,
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  double _cardHeight(BuildContext context, double cardWidth) {
    var labelHeight = 0.0;
    // Medir las etiquetas permite crecer sin recortes al ampliar el texto.
    for (final label in [
      'Ver mapa',
      'Mi ludoteca',
      'Mis amigos',
      'Marketplace',
    ]) {
      final painter =
          TextPainter(
            text: TextSpan(text: label, style: HomeQuickActionCard.labelStyle),
            textDirection: Directionality.of(context),
            textScaler: MediaQuery.textScalerOf(context),
          )..layout(
            maxWidth: math.max(
              0,
              cardWidth - HomeQuickActionCard.contentPadding * 2,
            ),
          );
      labelHeight = math.max(labelHeight, painter.height);
      painter.dispose();
    }

    return math.max(
      cardWidth * 0.7,
      HomeQuickActionCard.contentPadding * 2 +
          HomeQuickActionCard.iconBadgeSize +
          HomeQuickActionCard.labelSpacing +
          labelHeight,
    );
  }
}
