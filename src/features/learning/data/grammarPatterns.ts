// Grammar transform pattern templates

export interface GrammarPattern {
  instruction: string;
  instructionTr: string;
  pairs: Array<{ source: string; correct: string; distractors: string[] }>;
}

export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    instruction: 'Make it past tense',
    instructionTr: 'Geçmiş zamana çevir',
    pairs: [
      {
        source: 'I walk to school.',
        correct: 'I walked to school.',
        distractors: ['I walks to school.', 'I walking to school.', 'I did walk to school.'],
      },
      {
        source: 'She plays with a ball.',
        correct: 'She played with a ball.',
        distractors: [
          'She plays with a ball.',
          'She playing with a ball.',
          'She plaid with a ball.',
        ],
      },
      {
        source: 'They eat lunch.',
        correct: 'They ate lunch.',
        distractors: ['They eated lunch.', 'They eating lunch.', 'They eats lunch.'],
      },
      {
        source: 'He runs in the park.',
        correct: 'He ran in the park.',
        distractors: ['He runned in the park.', 'He running in the park.', 'He runs in the park.'],
      },
    ],
  },
  {
    instruction: 'Make it negative',
    instructionTr: 'Olumsuz yap',
    pairs: [
      {
        source: 'I like apples.',
        correct: 'I do not like apples.',
        distractors: ['I not like apples.', 'I no like apples.', 'I likes not apples.'],
      },
      {
        source: 'She is happy.',
        correct: 'She is not happy.',
        distractors: ['She not is happy.', 'She no happy.', 'She happy not.'],
      },
      {
        source: 'They can swim.',
        correct: 'They cannot swim.',
        distractors: ['They can not swim.', 'They no swim.', 'They swim cannot.'],
      },
      {
        source: 'He has a cat.',
        correct: 'He does not have a cat.',
        distractors: ['He not has a cat.', 'He no have a cat.', 'He have not a cat.'],
      },
    ],
  },
  {
    instruction: 'Make it a question',
    instructionTr: 'Soru cümlesi yap',
    pairs: [
      {
        source: 'She likes music.',
        correct: 'Does she like music?',
        distractors: ['Do she likes music?', 'She likes music?', 'Is she like music?'],
      },
      {
        source: 'They play football.',
        correct: 'Do they play football?',
        distractors: ['Does they play football?', 'They play football?', 'Are they play football?'],
      },
      {
        source: 'He is a teacher.',
        correct: 'Is he a teacher?',
        distractors: ['Does he a teacher?', 'He is a teacher?', 'Are he a teacher?'],
      },
      {
        source: 'You can dance.',
        correct: 'Can you dance?',
        distractors: ['Do you can dance?', 'You can dance?', 'Are you dance?'],
      },
    ],
  },
  {
    instruction: 'Use the correct pronoun',
    instructionTr: 'Doğru zamiri kullan',
    pairs: [
      {
        source: 'The boy runs fast.',
        correct: 'He runs fast.',
        distractors: ['She runs fast.', 'It runs fast.', 'They runs fast.'],
      },
      {
        source: 'The girls are happy.',
        correct: 'They are happy.',
        distractors: ['She are happy.', 'He is happy.', 'We are happy.'],
      },
      {
        source: 'My cat sleeps a lot.',
        correct: 'It sleeps a lot.',
        distractors: ['He sleeps a lot.', 'She sleeps a lot.', 'They sleeps a lot.'],
      },
      {
        source: 'Anna and I play.',
        correct: 'We play.',
        distractors: ['They play.', 'She play.', 'Us play.'],
      },
    ],
  },
  {
    instruction: 'Fix the word order',
    instructionTr: 'Kelime sırasını düzelt',
    pairs: [
      {
        source: 'school to go I',
        correct: 'I go to school.',
        distractors: ['To school I go.', 'Go I to school.', 'School I go to.'],
      },
      {
        source: 'is big the house',
        correct: 'The house is big.',
        distractors: ['Big is the house.', 'Is the house big.', 'House big is the.'],
      },
      {
        source: 'likes she cats',
        correct: 'She likes cats.',
        distractors: ['Likes she cats.', 'Cats likes she.', 'She cats likes.'],
      },
      {
        source: 'are playing children the',
        correct: 'The children are playing.',
        distractors: [
          'Children the are playing.',
          'Are playing the children.',
          'Playing are children the.',
        ],
      },
    ],
  },
  {
    instruction: 'Use the plural form',
    instructionTr: 'Çoğul hali kullan',
    pairs: [
      {
        source: 'one cat → two ___',
        correct: 'two cats',
        distractors: ['two cat', 'two cates', 'two catos'],
      },
      {
        source: 'one box → three ___',
        correct: 'three boxes',
        distractors: ['three boxs', 'three boxen', 'three box'],
      },
      {
        source: 'one baby → two ___',
        correct: 'two babies',
        distractors: ['two babys', 'two babyes', 'two baby'],
      },
      {
        source: 'one child → many ___',
        correct: 'many children',
        distractors: ['many childs', 'many childes', 'many child'],
      },
    ],
  },

  {
    instruction: 'Use "a" or "an"',
    instructionTr: '"a" veya "an" kullan',
    pairs: [
      {
        source: 'I see ___ apple.',
        correct: 'I see an apple.',
        distractors: ['I see a apple.', 'I see the apple.', 'I see apples.'],
      },
      {
        source: 'She has ___ umbrella.',
        correct: 'She has an umbrella.',
        distractors: ['She has a umbrella.', 'She has umbrella.', 'She has the umbrella.'],
      },
      {
        source: 'He is ___ boy.',
        correct: 'He is a boy.',
        distractors: ['He is an boy.', 'He is boy.', 'He is boys.'],
      },
      {
        source: 'This is ___ egg.',
        correct: 'This is an egg.',
        distractors: ['This is a egg.', 'This is egg.', 'This is eggs.'],
      },
    ],
  },
  {
    instruction: 'Change to present continuous',
    instructionTr: 'Şimdiki zamana çevir',
    pairs: [
      {
        source: 'I walk to school.',
        correct: 'I am walking to school.',
        distractors: [
          'I walking to school.',
          'I is walking to school.',
          'I are walking to school.',
        ],
      },
      {
        source: 'She reads a book.',
        correct: 'She is reading a book.',
        distractors: ['She reading a book.', 'She are reading a book.', 'She is read a book.'],
      },
      {
        source: 'They play football.',
        correct: 'They are playing football.',
        distractors: [
          'They is playing football.',
          'They playing football.',
          'They am playing football.',
        ],
      },
      {
        source: 'He eats lunch.',
        correct: 'He is eating lunch.',
        distractors: ['He eating lunch.', 'He are eating lunch.', 'He is eat lunch.'],
      },
    ],
  },
  {
    instruction: 'Use "there is" or "there are"',
    instructionTr: '"there is" veya "there are" kullan',
    pairs: [
      {
        source: 'A cat is on the bed.',
        correct: 'There is a cat on the bed.',
        distractors: [
          'There are a cat on the bed.',
          'There a cat on the bed.',
          'There is cats on the bed.',
        ],
      },
      {
        source: 'Two dogs are in the park.',
        correct: 'There are two dogs in the park.',
        distractors: [
          'There is two dogs in the park.',
          'There two dogs in the park.',
          'There are two dog in the park.',
        ],
      },
      {
        source: 'A book is on the table.',
        correct: 'There is a book on the table.',
        distractors: [
          'There are a book on the table.',
          'There book on the table.',
          'There is books on the table.',
        ],
      },
      {
        source: 'Many birds are in the sky.',
        correct: 'There are many birds in the sky.',
        distractors: [
          'There is many birds in the sky.',
          'There many birds in the sky.',
          'There are many bird in the sky.',
        ],
      },
    ],
  },
  {
    instruction: 'Use "some" or "any"',
    instructionTr: '"some" veya "any" kullan',
    pairs: [
      {
        source: 'I have ___ apples.',
        correct: 'I have some apples.',
        distractors: ['I have any apples.', 'I have a apples.', 'I have apples some.'],
      },
      {
        source: 'Do you have ___ milk?',
        correct: 'Do you have any milk?',
        distractors: ['Do you have some milk?', 'Do you have a milk?', 'Do you have milks?'],
      },
      {
        source: 'There are ___ books here.',
        correct: 'There are some books here.',
        distractors: [
          'There are any books here.',
          'There are a books here.',
          'There are the books here.',
        ],
      },
      {
        source: 'I do not have ___ water.',
        correct: 'I do not have any water.',
        distractors: [
          'I do not have some water.',
          'I do not have waters.',
          'I do not have a water.',
        ],
      },
    ],
  },
  {
    instruction: 'Add "will" for future',
    instructionTr: 'Gelecek zaman için "will" ekle',
    pairs: [
      {
        source: 'I go to school.',
        correct: 'I will go to school.',
        distractors: ['I will goes to school.', 'I going to school.', 'I wills go to school.'],
      },
      {
        source: 'She eats breakfast.',
        correct: 'She will eat breakfast.',
        distractors: [
          'She will eats breakfast.',
          'She wills eat breakfast.',
          'She will eating breakfast.',
        ],
      },
      {
        source: 'They play football.',
        correct: 'They will play football.',
        distractors: [
          'They will plays football.',
          'They wills play football.',
          'They will playing football.',
        ],
      },
      {
        source: 'He reads a book.',
        correct: 'He will read a book.',
        distractors: ['He will reads a book.', 'He wills read a book.', 'He will reading a book.'],
      },
    ],
  },
  {
    instruction: 'Use "much" or "many"',
    instructionTr: '"much" veya "many" kullan',
    pairs: [
      {
        source: 'I have ___ friends.',
        correct: 'I have many friends.',
        distractors: ['I have much friends.', 'I have a friends.', 'I have little friends.'],
      },
      {
        source: 'There is not ___ water.',
        correct: 'There is not much water.',
        distractors: ['There is not many water.', 'There is not waters.', 'There is not a water.'],
      },
      {
        source: 'She has ___ books.',
        correct: 'She has many books.',
        distractors: ['She has much books.', 'She has a books.', 'She has few book.'],
      },
      {
        source: 'I do not have ___ time.',
        correct: 'I do not have much time.',
        distractors: ['I do not have many time.', 'I do not have times.', 'I do not have a time.'],
      },
    ],
  },
  {
    instruction: 'Change to comparative (-er)',
    instructionTr: 'Karşılaştırma yap (-er)',
    pairs: [
      {
        source: 'The dog is big. The horse is ___.',
        correct: 'The horse is bigger.',
        distractors: ['The horse is more big.', 'The horse is biger.', 'The horse is biggest.'],
      },
      {
        source: 'The cat is fast. The dog is ___.',
        correct: 'The dog is faster.',
        distractors: ['The dog is more fast.', 'The dog is fastest.', 'The dog is fasting.'],
      },
      {
        source: 'My room is small. Your room is ___.',
        correct: 'Your room is smaller.',
        distractors: [
          'Your room is more small.',
          'Your room is smallest.',
          'Your room is smalling.',
        ],
      },
      {
        source: 'This tree is tall. That tree is ___.',
        correct: 'That tree is taller.',
        distractors: ['That tree is more tall.', 'That tree is tallest.', 'That tree is talling.'],
      },
    ],
  },
  {
    instruction: 'Change to superlative (-est)',
    instructionTr: 'En üstünlük yap (-est)',
    pairs: [
      {
        source: 'The elephant is the ___ animal.',
        correct: 'The elephant is the biggest animal.',
        distractors: [
          'The elephant is the most big animal.',
          'The elephant is the bigger animal.',
          'The elephant is biggest animal.',
        ],
      },
      {
        source: 'She is the ___ runner.',
        correct: 'She is the fastest runner.',
        distractors: [
          'She is the most fast runner.',
          'She is the faster runner.',
          'She is fastest runner.',
        ],
      },
      {
        source: 'This is the ___ day.',
        correct: 'This is the longest day.',
        distractors: [
          'This is the most long day.',
          'This is the longer day.',
          'This is longest day.',
        ],
      },
    ],
  },
  {
    instruction: 'Add "must" to the sentence',
    instructionTr: 'Cümleye "must" ekle',
    pairs: [
      {
        source: 'I study for the test.',
        correct: 'I must study for the test.',
        distractors: [
          'I must studies for the test.',
          'I musts study for the test.',
          'I must studying for the test.',
        ],
      },
      {
        source: 'She goes to the doctor.',
        correct: 'She must go to the doctor.',
        distractors: [
          'She must goes to the doctor.',
          'She musts go to the doctor.',
          'She must going to the doctor.',
        ],
      },
      {
        source: 'We finish our homework.',
        correct: 'We must finish our homework.',
        distractors: [
          'We must finishes our homework.',
          'We musts finish our homework.',
          'We must finishing our homework.',
        ],
      },
    ],
  },
  {
    instruction: 'Add "should" to the sentence',
    instructionTr: 'Cümleye "should" ekle',
    pairs: [
      {
        source: 'You eat breakfast.',
        correct: 'You should eat breakfast.',
        distractors: [
          'You should eats breakfast.',
          'You shoulds eat breakfast.',
          'You should eating breakfast.',
        ],
      },
      {
        source: 'He goes to bed early.',
        correct: 'He should go to bed early.',
        distractors: [
          'He should goes to bed early.',
          'He shoulds go to bed early.',
          'He should going to bed early.',
        ],
      },
      {
        source: 'We drink water.',
        correct: 'We should drink water.',
        distractors: [
          'We should drinks water.',
          'We shoulds drink water.',
          'We should drinking water.',
        ],
      },
    ],
  },
  {
    instruction: 'Change to past with was/were',
    instructionTr: 'was/were ile geçmişe çevir',
    pairs: [
      {
        source: 'I am happy.',
        correct: 'I was happy.',
        distractors: ['I were happy.', 'I is happy.', 'I been happy.'],
      },
      {
        source: 'She is at school.',
        correct: 'She was at school.',
        distractors: ['She were at school.', 'She been at school.', 'She is at school.'],
      },
      {
        source: 'They are tired.',
        correct: 'They were tired.',
        distractors: ['They was tired.', 'They been tired.', 'They is tired.'],
      },
      {
        source: 'We are at the park.',
        correct: 'We were at the park.',
        distractors: ['We was at the park.', 'We been at the park.', 'We is at the park.'],
      },
    ],
  },
  {
    instruction: "Use possessive ('s)",
    instructionTr: "İyelik ('s) kullan",
    pairs: [
      {
        source: 'The dog belongs to Tom.',
        correct: "It is Tom's dog.",
        distractors: ['It is Tom dog.', "It is Toms' dog.", 'It is dog of Tom.'],
      },
      {
        source: 'The book belongs to Sara.',
        correct: "It is Sara's book.",
        distractors: ['It is Sara book.', "It is Saras' book.", 'It is book of Sara.'],
      },
      {
        source: 'The toy belongs to the baby.',
        correct: "It is the baby's toy.",
        distractors: ['It is the baby toy.', "It is the babys' toy.", 'It is toy of baby.'],
      },
    ],
  },
  {
    instruction: 'Add "always", "never" or "sometimes"',
    instructionTr: '"always", "never" veya "sometimes" ekle',
    pairs: [
      {
        source: 'I brush my teeth.',
        correct: 'I always brush my teeth.',
        distractors: [
          'I brush always my teeth.',
          'Always I brush my teeth.',
          'I brushs always my teeth.',
        ],
      },
      {
        source: 'She eats candy.',
        correct: 'She never eats candy.',
        distractors: ['She eats never candy.', 'Never she eats candy.', 'She never eat candy.'],
      },
      {
        source: 'We play in the rain.',
        correct: 'We sometimes play in the rain.',
        distractors: [
          'We play sometimes in the rain.',
          'Sometimes we plays in the rain.',
          'We sometime play in the rain.',
        ],
      },
    ],
  },
  {
    instruction: 'Change to "going to" future',
    instructionTr: '"going to" ile geleceğe çevir',
    pairs: [
      {
        source: 'I eat lunch.',
        correct: 'I am going to eat lunch.',
        distractors: ['I going to eat lunch.', 'I am going eat lunch.', 'I am go to eat lunch.'],
      },
      {
        source: 'She plays tennis.',
        correct: 'She is going to play tennis.',
        distractors: [
          'She going to play tennis.',
          'She is going play tennis.',
          'She is go to play tennis.',
        ],
      },
      {
        source: 'They visit Grandma.',
        correct: 'They are going to visit Grandma.',
        distractors: [
          'They going to visit Grandma.',
          'They are going visit Grandma.',
          'They are go to visit Grandma.',
        ],
      },
    ],
  },
  {
    instruction: 'Use "this/these" or "that/those"',
    instructionTr: '"this/these" veya "that/those" kullan',
    pairs: [
      {
        source: '___ book is mine. (near)',
        correct: 'This book is mine.',
        distractors: ['That book is mine.', 'These book is mine.', 'Those book is mine.'],
      },
      {
        source: '___ cats are cute. (near)',
        correct: 'These cats are cute.',
        distractors: ['This cats are cute.', 'Those cats are cute.', 'That cats are cute.'],
      },
      {
        source: '___ tree is tall. (far)',
        correct: 'That tree is tall.',
        distractors: ['This tree is tall.', 'Those tree is tall.', 'These tree is tall.'],
      },
      {
        source: '___ birds are singing. (far)',
        correct: 'Those birds are singing.',
        distractors: [
          'These birds are singing.',
          'That birds are singing.',
          'This birds are singing.',
        ],
      },
    ],
  },
  {
    instruction: 'Add the correct preposition (in/on/at)',
    instructionTr: 'Doğru edatı ekle (in/on/at)',
    pairs: [
      {
        source: 'I am ___ school.',
        correct: 'I am at school.',
        distractors: ['I am in school.', 'I am on school.', 'I am to school.'],
      },
      {
        source: 'The cat is ___ the box.',
        correct: 'The cat is in the box.',
        distractors: ['The cat is on the box.', 'The cat is at the box.', 'The cat is to the box.'],
      },
      {
        source: 'The book is ___ the table.',
        correct: 'The book is on the table.',
        distractors: [
          'The book is in the table.',
          'The book is at the table.',
          'The book is to the table.',
        ],
      },
      {
        source: "We meet ___ three o'clock.",
        correct: "We meet at three o'clock.",
        distractors: [
          "We meet in three o'clock.",
          "We meet on three o'clock.",
          "We meet to three o'clock.",
        ],
      },
    ],
  },
  {
    instruction: 'Make it an exclamation',
    instructionTr: 'Ünlem cümlesi yap',
    pairs: [
      {
        source: 'The cake is good.',
        correct: 'What a good cake!',
        distractors: ['What good cake!', 'How a good cake!', 'What cake good!'],
      },
      {
        source: 'The dog is big.',
        correct: 'What a big dog!',
        distractors: ['What big dog!', 'How a big dog!', 'What dog big!'],
      },
      {
        source: 'She runs fast.',
        correct: 'How fast she runs!',
        distractors: ['What fast she runs!', 'How she runs fast!', 'How fast runs she!'],
      },
    ],
  },
  {
    instruction: 'Use "because" to give a reason',
    instructionTr: '"because" ile neden belirt',
    pairs: [
      {
        source: 'I am happy. + I have a dog.',
        correct: 'I am happy because I have a dog.',
        distractors: [
          'I am happy so I have a dog.',
          'I am happy but I have a dog.',
          'I am happy and I have a dog.',
        ],
      },
      {
        source: 'She is tired. + She ran a lot.',
        correct: 'She is tired because she ran a lot.',
        distractors: [
          'She is tired so she ran a lot.',
          'She is tired but she ran a lot.',
          'She is tired and she ran a lot.',
        ],
      },
      {
        source: 'We stay inside. + It rains.',
        correct: 'We stay inside because it rains.',
        distractors: [
          'We stay inside so it rains.',
          'We stay inside but it rains.',
          'We stay inside and it rains.',
        ],
      },
    ],
  },
  {
    instruction: 'Add "too" or "also"',
    instructionTr: '"too" veya "also" ekle',
    pairs: [
      {
        source: 'I like pizza. She likes pizza.',
        correct: 'She likes pizza too.',
        distractors: ['She also pizza likes.', 'She pizza too likes.', 'She too likes pizza.'],
      },
      {
        source: 'He plays guitar. He plays piano.',
        correct: 'He also plays piano.',
        distractors: ['He plays also piano.', 'He too plays piano.', 'He plays piano also too.'],
      },
      {
        source: 'I can swim. I can run.',
        correct: 'I can also run.',
        distractors: ['I also can run.', 'I can run also too.', 'Also I can run.'],
      },
    ],
  },
  {
    instruction: 'Change to "would like"',
    instructionTr: '"would like" ile değiştir',
    pairs: [
      {
        source: 'I want water.',
        correct: 'I would like water.',
        distractors: ['I would want water.', 'I will like water.', 'I would likes water.'],
      },
      {
        source: 'She wants cake.',
        correct: 'She would like cake.',
        distractors: ['She would wants cake.', 'She will like cake.', 'She would likes cake.'],
      },
      {
        source: 'We want to play.',
        correct: 'We would like to play.',
        distractors: ['We would want to play.', 'We will like to play.', 'We would likes to play.'],
      },
    ],
  },
  {
    instruction: 'Make it polite with "please"',
    instructionTr: '"please" ile kibar yap',
    pairs: [
      {
        source: 'Give me the book.',
        correct: 'Please give me the book.',
        distractors: [
          'Please gives me the book.',
          'Give please me the book.',
          'Give me please book the.',
        ],
      },
      {
        source: 'Open the door.',
        correct: 'Please open the door.',
        distractors: ['Please opens the door.', 'Open please the door.', 'Open the please door.'],
      },
      {
        source: 'Help me.',
        correct: 'Please help me.',
        distractors: ['Please helps me.', 'Help please me.', 'Me please help.'],
      },
    ],
  },
  {
    instruction: 'Add "very" or "really"',
    instructionTr: '"very" veya "really" ekle',
    pairs: [
      {
        source: 'The dog is big.',
        correct: 'The dog is very big.',
        distractors: ['The very dog is big.', 'The dog very is big.', 'Very the dog is big.'],
      },
      {
        source: 'She sings well.',
        correct: 'She sings really well.',
        distractors: ['She really sings well.', 'She sings well really.', 'Really she sings well.'],
      },
      {
        source: 'The cake is good.',
        correct: 'The cake is really good.',
        distractors: [
          'The really cake is good.',
          'The cake really is good.',
          'Really the cake is good.',
        ],
      },
    ],
  },
  {
    instruction: 'Change "I" to "we"',
    instructionTr: '"I" yerine "we" koy',
    pairs: [
      {
        source: 'I am happy.',
        correct: 'We are happy.',
        distractors: ['We is happy.', 'We am happy.', 'We be happy.'],
      },
      {
        source: 'I have a dog.',
        correct: 'We have a dog.',
        distractors: ['We has a dog.', 'We having a dog.', 'We haves a dog.'],
      },
      {
        source: 'I like pizza.',
        correct: 'We like pizza.',
        distractors: ['We likes pizza.', 'We liking pizza.', 'We is like pizza.'],
      },
      {
        source: 'I go to school.',
        correct: 'We go to school.',
        distractors: ['We goes to school.', 'We going to school.', 'We is go to school.'],
      },
    ],
  },
  {
    instruction: 'Rewrite using "have to"',
    instructionTr: '"have to" kullanarak yeniden yaz',
    pairs: [
      {
        source: 'I must study.',
        correct: 'I have to study.',
        distractors: ['I has to study.', 'I have study.', 'I having to study.'],
      },
      {
        source: 'She must go home.',
        correct: 'She has to go home.',
        distractors: ['She have to go home.', 'She has go home.', 'She having to go home.'],
      },
      {
        source: 'We must eat dinner.',
        correct: 'We have to eat dinner.',
        distractors: ['We has to eat dinner.', 'We have eat dinner.', 'We having to eat dinner.'],
      },
    ],
  },
];
