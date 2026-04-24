# TTS Placeholder Normalization Report

Shared runtime/generator normalization now hashes prompt text after converting `___` blanks to spoken ellipses (`...`).

## Summary

- Total prompts whose manifest key hash changed after placeholder normalization: 133
- Highest-traffic affected files in this pass:
  - `src/features/learning/data/conversations/registry/phase3/home/myRoutine.ts` (8)
  - `src/features/learning/data/conversations/registry/phase3/transport/howDoYouGo.ts` (8)
  - `src/features/learning/data/conversations/registry/phase3/nature/inTheForest.ts` (7)
  - `src/features/learning/data/conversations/registry/phase4/jobs/whatDoYouWork.ts` (7)
  - `src/features/learning/data/storyBank.ts` (6)

## Open-ended Scenarios Touched In This Release

### `phase1_animals_pet_shop_pick`

- `What color is your pet? Tell me: It is ___!`
  - normalized: `What color is your pet? Tell me: It is ...!`
  - hash: `8ae31c82e5dc22ca -> b1a6758e5e5fecb6`
- `Give your pet a name! Say: Its name is ___!`
  - normalized: `Give your pet a name! Say: Its name is ...!`
  - hash: `936687fd120dfa73 -> 1eee45b543e946e6`

### `phase3_home_my_routine`

- `Good morning! What do you do every morning? Tell me with: Every morning I ___`
  - normalized: `Good morning! What do you do every morning? Tell me with: Every morning I ...`
  - hash: `3f5047831eb2f965 -> 3f6c023718c2f340`
- `I love routines! {{morningRoutineCapitalized}} sounds like a great start. Now tell me two things: First I ___, then I ___`
  - normalized: `I love routines! {{morningRoutineCapitalized}} sounds like a great start. Now tell me two things: First I ..., then I ...`
  - hash: `9f3a2e52e291feee -> 438237959ce2e817`
- `Nice! {{morningHabitCapitalized}} sounds super helpful. Tell me two morning things in order: First I ___, then I ___`
  - normalized: `Nice! {{morningHabitCapitalized}} sounds super helpful. Tell me two morning things in order: First I ..., then I ...`
  - hash: `5622044c1a77835d -> 001fdb626a09cf33`
- `School is finished! What do you do after school? Say: After school I ___`
  - normalized: `School is finished! What do you do after school? Say: After school I ...`
  - hash: `91bc4262ad8c6fc5 -> f912e0c4f4b15787`
- `That sounds fun! {{afterSchoolRoutineCapitalized}} after school makes your day busy. Now tell me about your evening. Say: Every evening I ___`
  - normalized: `That sounds fun! {{afterSchoolRoutineCapitalized}} after school makes your day busy. Now tell me about your evening. Say: Every evening I ...`
  - hash: `7492e51b9e1ae544 -> 93c6f9e667a28951`
- `Lovely! {{eveningRoutineCapitalized}} sounds cozy. Tell me your evening order: First I ___, then I ___`
  - normalized: `Lovely! {{eveningRoutineCapitalized}} sounds cozy. Tell me your evening order: First I ..., then I ...`
  - hash: `a3d1a0e5b582887a -> 7c256934e9f5b24e`
- `Great order! {{eveningOrderCapitalized}} is a nice evening plan. Bedtime soon! What do you do every night before sleeping? Say: Every night I ___`
  - normalized: `Great order! {{eveningOrderCapitalized}} is a nice evening plan. Bedtime soon! What do you do every night before sleeping? Say: Every night I ...`
  - hash: `067a5627277d48f3 -> c7632114b8959045`
- `Last challenge! Tell me your FULL morning routine. Use: First I ___, then I ___, and then I ___`
  - normalized: `Last challenge! Tell me your FULL morning routine. Use: First I ..., then I ..., and then I ...`
  - hash: `26258c4e1d531aab -> f7fddd568faa6bdf`

### `phase3_home_my_favorite_sport`

- `Tell me YOUR favourite sport! 🏆 Say: My favourite sport is ___!`
  - normalized: `Tell me YOUR favourite sport! 🏆 Say: My favourite sport is ...!`
  - hash: `2966d10ff469f39c -> dd4cae81293ed9bb`
- `Tell me ONE sport you play AND one you do NOT play! Use: I play ___ and I do not play ___!`
  - normalized: `Tell me ONE sport you play AND one you do NOT play! Use: I play ... and I do not play ...!`
  - hash: `af551b1e44a1f330 -> 51bef079bad3854b`

### `phase4_friends_my_best_friend`

- `Tell me about your best friend! Say: My best friend is ___.`
  - normalized: `Tell me about your best friend! Say: My best friend is . ...`
  - hash: `e7dadfd2a286ce94 -> 22e8fd3b19d52d98`

### `phase4_jobs_i_want_to_be`

- `When I grow up, I want to be an astronaut! What about you? Say: I want to be a ___!`
  - normalized: `When I grow up, I want to be an astronaut! What about you? Say: I want to be a ...!`
  - hash: `e61b5fc12ec9587a -> dc945121e9dce3c6`
- `Wow, amazing dream! What will you DO as {{futureJobWithArticle}}? Say: I will ___.`
  - normalized: `Wow, amazing dream! What will you DO as {{futureJobWithArticle}}? Say: I will . ...`
  - hash: `2ff5b24bc24891eb -> af884f6c968652b2`
- `That sounds fantastic! So your dream job is ___? Say: My dream job is ___.`
  - normalized: `That sounds fantastic! So your dream job is ...? Say: My dream job is . ...`
  - hash: `92fcd2c0896dde2c -> 5dacae8953b7b4cb`
- `Cool! Why do you want to be {{dreamJobWithArticle}}? Because you like to ___?`
  - normalized: `Cool! Why do you want to be {{dreamJobWithArticle}}? Because you like to ...?`
  - hash: `1c7db7fc66cf1a86 -> 5dc30eba24a5f7fd`
- `What do you need to be good at to be a great ___?`
  - normalized: `What do you need to be good at to be a great ...?`
  - hash: `b187d498a2b68ab7 -> f9e0f77ee0e044c8`

### `phase4_school_my_favorite_subject`

- `What subject do you love most at school? Say: My favourite subject is ___!`
  - normalized: `What subject do you love most at school? Say: My favourite subject is ...!`
  - hash: `af7ef24c98a41823 -> 40d5c787e28c0229`
- `Great choice! What do you do in {{favoriteSubject}} class? Say: In ___ class we ___!`
  - normalized: `Great choice! What do you do in {{favoriteSubject}} class? Say: In ... class we ...!`
  - hash: `38c3d96539f6e484 -> 687524df2722e8ae`
- `Are you good at it? Tell me: I am good at ___!`
  - normalized: `Are you good at it? Tell me: I am good at ...!`
  - hash: `8ea13b98190685ae -> 858d51830c51819d`
- `Is there a subject that is hard for you? Say: ___ is hard for me.`
  - normalized: `Is there a subject that is hard for you? Say: ... is hard for me.`
  - hash: `7239031568b55499 -> b48851bb6275d370`
- `What do you want to learn next? Say: I want to learn ___!`
  - normalized: `What do you want to learn next? Say: I want to learn ...!`
  - hash: `009396e6cba8ac1d -> b0e491c577967a30`

### `phase4_sports_my_favorite_team`

- `Do you have a favourite sports team? Say: My favourite team is ___!`
  - normalized: `Do you have a favourite sports team? Say: My favourite team is ...!`
  - hash: `01a6b1d92099e116 -> 4c57763384b4b18a`

### `phase5_friends_who_is_your_hero`

- `Everyone has a hero! Who is YOUR hero? Say: My hero is ___!`
  - normalized: `Everyone has a hero! Who is YOUR hero? Say: My hero is ...!`
  - hash: `e7fa7c03a2cbe594 -> 89147de43a5f3a9c`
- `Do you want to be like your hero? Say: I want to be like ___!`
  - normalized: `Do you want to be like your hero? Say: I want to be like ...!`
  - hash: `c3547a519ed8a3ec -> 128cd4ccdf4a1098`
- `What can YOU do to be like your hero? Say: I can ___!`
  - normalized: `What can YOU do to be like your hero? Say: I can ...!`
  - hash: `56f0139e61f14406 -> 2699e6c282c14837`

### `phase5_jobs_my_dream_job`

- `Today we dream about the future! 🌟 What do you want to be when you grow up? Say: When I grow up I want to be ___!`
  - normalized: `Today we dream about the future! 🌟 What do you want to be when you grow up? Say: When I grow up I want to be ...!`
  - hash: `4d662df48cd06abb -> 9e87c836388d9987`
- `Share your dream with a full sentence! Say: My dream is to ___!`
  - normalized: `Share your dream with a full sentence! Say: My dream is to ...!`
  - hash: `64027f06ead94ba1 -> 10aa98c93402ebf3`
- `Tell us your plan! Say: I will study hard and ___!`
  - normalized: `Tell us your plan! Say: I will study hard and ...!`
  - hash: `2a386571355baaee -> 49f2a23aa682c4b4`
- `Totally agree! 🌈 One day people will talk about YOU — the incredible ___!`
  - normalized: `Totally agree! 🌈 One day people will talk about YOU — the incredible ...!`
  - hash: `d75c1173c3bb9b12 -> bf416a28d8ad9125`

## Note

Prompts where `___` is immediately followed by punctuation currently normalize to strings like `. ...` under the shared runtime/generator normalizer. That is reflected in the generated manifest keys above and is included here for traceability.
