import 'package:flutter/widgets.dart';

import '../widgets/home_header.dart';
import '../widgets/home_quick_actions.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({this.userName = 'Enrique', super.key});

  // Dato visual provisional; recibirá el nombre visible de la cuenta con sesión.
  final String userName;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(24, 16, 24, 0),
            child: HomeHeader(),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 36),
            child: Semantics(
              header: true,
              child: Text(
                'Hola, $userName',
                style: const TextStyle(
                  fontFamily: 'JekoSemiBold',
                  fontSize: 28,
                  height: 1.2,
                ),
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(32, 0, 32, 24),
            child: HomeQuickActions(),
          ),
        ],
      ),
    );
  }
}
