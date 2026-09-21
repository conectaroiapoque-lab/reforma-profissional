# Bootstrap do Gradle Wrapper no computador de release

O `android/gradle/wrapper/gradle-wrapper.jar` é binário gerável e, por isso, não é versionado. Os scripts `gradlew`, `gradlew.bat`, `gradle-wrapper.properties` e toda a configuração Android textual permanecem no Git.

Antes de compilar o AAB, instale uma distribuição oficial do Gradle compatível com a versão declarada em `android/gradle/wrapper/gradle-wrapper.properties` e execute, a partir de `android/`:

```bash
gradle wrapper --gradle-version 8.11.1
```

Confirme a origem e o checksum da distribuição conforme a documentação oficial do Gradle. Depois execute `npm run mobile:assets`, `npm run sync:android` e a tarefa de bundle assinada. O JAR regenerado continua ignorado e não deve ser commitado. Nenhum teste ou `build:web` baixa esse binário.
