import 'package:flutter/widgets.dart';

import 'home_header.dart';
import 'section_placeholder.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(24, 16, 24, 0),
          child: HomeHeader(),
        ),
        Expanded(child: SectionPlaceholder(title: 'Inicio')),
      ],
    );
  }
}
