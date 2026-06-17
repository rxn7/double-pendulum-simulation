# Symulator Podwójnego Wahadła
Ta aplikacja służy jako interaktywne narzędzie edukacyjne, które wizualizuje ruch podwójnego wahadła. 

Symulator pozwala zaobserwować założenia teorii chaosu deterministycznego, demonstrując zjawisko transferu pędu i energii między ramionami wahadła.

Zauważyć możemy "efekt motyla" - ekstremalną wrażliwość układu na drobne zmiany zmiennych symulacji.

Aplikacja posiada prosty interfejs, który umożliwia eksperymentowanie z różnymi zmiennymi symulacji. 
Możliwe też jest zatrzymanie symulacji i ręczne ustawienie pozycji ramion za pomocą kursora.

**🌍 Wersja Live:** [Uruchom symulację w przeglądarce](https://rxn7.github.io/double-pendulum-simulation/)

## Silnik fizyczny

### Stały odstęp czasowy

Symulacja operuje w sztywnym interwale czasowym - 120 Hz. Gwarantuje to płynne i powtarzalne działanie symulacji niezależnie od wydajności urządzenia, na którym działa.

### Mechanika Lagrange'a

Zrezygnowałem z klasycznej dynamiki Newtona na rzecz mechaniki Lagrange'a, w której analizuje się energię kinetyczną i potencjalną w celu wyznaczenia przyspieszeń kątowych w każdym "kroku" symulacji.

### Runge-Kutta
Układ podwójnego wahadła jest na tyle chaotyczny, że zwykła liniowa integracja była za mało stabilna.

Zastosowałem algorytm całkowania numerycznego Rungego-Kutty IV rzędu (RK4), który uśrednia cztery próbki pochodnych przed aktualizacją pozycji, chroniąc układ przed drobnymi błędami numerycznymi i destabilizacją.

## Technologie

Projekt został napisany przy użyciu technologii: TypeScript, HTML, CSS.
Symulacja jest "rysowana" przy użyciu wbudowanego w HTML API - Canvas2D.

## Kod

Kod został napisany trzymając się standardów clean code, oraz podzielony na następujące moduły:

### Simulation
- Serce programu, łączy silnik fizyczny z rysowaniem. 
- Zajmuje się interakcją kursora z ramionami symulacji.

### DoublePendulum
- Cała istotna logika symulacji się w niej znajduje.
- Oblicza równania ruchu.
- Całkowanie numeryczne (RK4).

### Renderer
- Odpowiada za rysowanie wahadła za pomocą podstawowej trygonometrii.
- Wizualizacja chaosu, dzięki rysowaniu "historii" wahadła.
- Poprawne skalowanie na każdym urządzeniu.

### SimulationProperties
- Globalny obiekt przechowujący właściwości symulacji, m. in: siła grawitacji, siła tarcia, masa i długości ramion.

### UIHandler
- Odpowiada za interakcje użytkownika z bocznym panelem symulacji.
