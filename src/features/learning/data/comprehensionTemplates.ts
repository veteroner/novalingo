// Story comprehension passage templates

export interface ComprehensionTemplate {
  passage: string;
  passageTranslation: string;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
  keywords: string[];
}

export const COMPREHENSION_TEMPLATES: ComprehensionTemplate[] = [
  {
    passage:
      'Tom has a red ball. He plays with it every day. He throws the ball and catches it. His dog Rex runs after the ball too. They both love to play!',
    passageTranslation:
      "Tom'un kırmızı bir topu var. Onunla her gün oynar. Topu atar ve yakalar. Köpeği Rex de topun peşinden koşar. İkisi de oynamayı seviyor!",
    questions: [
      {
        question: 'What color is the ball?',
        options: ['Blue', 'Red', 'Green', 'Yellow'],
        correctIndex: 1,
      },
      {
        question: 'Who runs after the ball?',
        options: ['Tom', 'His cat', 'His dog Rex', 'His friend'],
        correctIndex: 2,
      },
    ],
    keywords: ['ball', 'play', 'dog', 'red'],
  },
  {
    passage:
      'My family is big. I have two sisters and one brother. My mother is a teacher and my father is a doctor. We live in a blue house. We love each other very much.',
    passageTranslation:
      'Ailem büyük. İki kız kardeşim ve bir erkek kardeşim var. Annem öğretmen ve babam doktor. Mavi bir evde yaşıyoruz. Birbirimizi çok seviyoruz.',
    questions: [
      {
        question: 'How many sisters are there?',
        options: ['One', 'Two', 'Three', 'Four'],
        correctIndex: 1,
      },
      {
        question: 'What color is the house?',
        options: ['Red', 'White', 'Blue', 'Green'],
        correctIndex: 2,
      },
    ],
    keywords: ['family', 'sister', 'brother', 'mother', 'father', 'house'],
  },
  {
    passage:
      'It is a sunny day. We go to the beach. The water is blue and warm. We build a sandcastle. We eat ice cream. What a fun day!',
    passageTranslation:
      'Güneşli bir gün. Plaja gidiyoruz. Su mavi ve ılık. Kumdan kale yapıyoruz. Dondurma yiyoruz. Ne güzel bir gün!',
    questions: [
      {
        question: 'Where do they go?',
        options: ['Park', 'Beach', 'School', 'Mountain'],
        correctIndex: 1,
      },
      {
        question: 'What do they build?',
        options: ['Snowman', 'House', 'Sandcastle', 'Tower'],
        correctIndex: 2,
      },
    ],
    keywords: ['beach', 'sun', 'water', 'sand', 'ice cream'],
  },
  {
    passage:
      'The bird sits on the tree. It is small and brown. It sings a beautiful song every morning. The other birds listen to it. They are in the garden.',
    passageTranslation:
      'Kuş ağacın üstünde durur. Küçük ve kahverengi. Her sabah güzel bir şarkı söyler. Diğer kuşlar onu dinler. Bahçedeler.',
    questions: [
      {
        question: 'Where does the bird sit?',
        options: ['On a house', 'On a tree', 'On a car', 'On a chair'],
        correctIndex: 1,
      },
      {
        question: 'What does the bird do?',
        options: ['Flies away', 'Eats food', 'Sings a song', 'Sleeps'],
        correctIndex: 2,
      },
    ],
    keywords: ['bird', 'tree', 'sing', 'garden', 'morning'],
  },
  {
    passage:
      'Today is Monday. I wake up early. I put on my school uniform. I eat cereal for breakfast. My mother drives me to school. I love Mondays because we have art class.',
    passageTranslation:
      'Bugün Pazartesi. Erken uyanıyorum. Okul üniformamı giyiyorum. Kahvaltıda tahıl yiyorum. Annem beni okula götürür. Pazartesileri severim çünkü resim dersimiz var.',
    questions: [
      {
        question: 'What day is it?',
        options: ['Tuesday', 'Monday', 'Wednesday', 'Friday'],
        correctIndex: 1,
      },
      {
        question: 'Why does the child love Mondays?',
        options: ['No school', 'Art class', 'Math class', 'Free time'],
        correctIndex: 1,
      },
    ],
    keywords: ['Monday', 'school', 'breakfast', 'morning'],
  },
  {
    passage:
      'Sara wants to be a vet. She loves animals. She has a dog, a cat, and two fish. She reads books about animals every night. Her dream is to help sick animals.',
    passageTranslation:
      'Sara veteriner olmak istiyor. Hayvanları seviyor. Bir köpeği, bir kedisi ve iki balığı var. Her gece hayvanlar hakkında kitap okur. Hayali hasta hayvanlara yardım etmek.',
    questions: [
      {
        question: 'What does Sara want to be?',
        options: ['A teacher', 'A doctor', 'A vet', 'A cook'],
        correctIndex: 2,
      },
      {
        question: 'How many fish does she have?',
        options: ['One', 'Two', 'Three', 'Four'],
        correctIndex: 1,
      },
    ],
    keywords: ['animal', 'dog', 'cat', 'fish', 'vet'],
  },
  {
    passage:
      'We have dinner at seven. Mom cooks spaghetti. It is my favorite food. I help her in the kitchen. I wash the vegetables. We set the table together. The spaghetti is delicious!',
    passageTranslation:
      'Yedide akşam yemeği yeriz. Annem spagetti pişirir. En sevdiğim yemek. Mutfakta ona yardım ederim. Sebzeleri yıkarım. Birlikte sofrayı kurarız. Spagetti çok lezzetli!',
    questions: [
      {
        question: 'What does Mom cook?',
        options: ['Pizza', 'Rice', 'Spaghetti', 'Soup'],
        correctIndex: 2,
      },
      {
        question: 'What time is dinner?',
        options: ['Six', 'Seven', 'Eight', 'Five'],
        correctIndex: 1,
      },
    ],
    keywords: ['dinner', 'cook', 'food', 'kitchen', 'eat'],
  },
  {
    passage:
      'The park is near our house. There is a big slide and two swings. I go there with my friends after school. We play hide and seek. Sometimes we feed the ducks in the pond.',
    passageTranslation:
      'Park evimizin yakınında. Büyük bir kaydırak ve iki salıncak var. Okuldan sonra arkadaşlarımla oraya giderim. Saklambaç oynarız. Bazen göldeki ördekleri besleriz.',
    questions: [
      {
        question: 'Where is the park?',
        options: ['Far away', 'Near the school', 'Near their house', 'In the city'],
        correctIndex: 2,
      },
      {
        question: 'What game do they play?',
        options: ['Football', 'Tag', 'Hide and seek', 'Board games'],
        correctIndex: 2,
      },
    ],
    keywords: ['park', 'play', 'friend', 'duck', 'slide'],
  },

  {
    passage:
      'My name is Lily. I have a little garden. I plant flowers every spring. My favorite flowers are sunflowers. They are big and yellow. I water them every day.',
    passageTranslation:
      'Benim adım Lily. Küçük bir bahçem var. Her ilkbaharda çiçek dikerim. En sevdiğim çiçekler ayçiçekleri. Büyük ve sarılar. Onları her gün sularım.',
    questions: [
      {
        question: 'What does Lily plant?',
        options: ['Trees', 'Vegetables', 'Flowers', 'Grass'],
        correctIndex: 2,
      },
      {
        question: 'What color are sunflowers?',
        options: ['Red', 'Blue', 'Pink', 'Yellow'],
        correctIndex: 3,
      },
    ],
    keywords: ['garden', 'flower', 'plant', 'yellow', 'water'],
  },
  {
    passage:
      'Ben is seven years old. He goes to school every day. His favorite subject is math because he likes numbers. After school, he plays with his dog Max.',
    passageTranslation:
      'Ben yedi yaşında. Her gün okula gider. En sevdiği ders matematik çünkü sayıları sever. Okuldan sonra köpeği Max ile oynar.',
    questions: [
      { question: 'How old is Ben?', options: ['Five', 'Six', 'Seven', 'Eight'], correctIndex: 2 },
      {
        question: 'What is his favorite subject?',
        options: ['English', 'Math', 'Art', 'Music'],
        correctIndex: 1,
      },
    ],
    keywords: ['school', 'seven', 'math', 'dog'],
  },
  {
    passage:
      'Anna and her mother go to the market on Saturday. They buy apples, bread, and cheese. Anna carries the bag. She is a good helper.',
    passageTranslation:
      'Anna ve annesi cumartesi pazara gider. Elma, ekmek ve peynir alırlar. Anna çantayı taşır. O iyi bir yardımcı.',
    questions: [
      {
        question: 'When do they go to the market?',
        options: ['Monday', 'Friday', 'Saturday', 'Sunday'],
        correctIndex: 2,
      },
      {
        question: 'Who carries the bag?',
        options: ['Mother', 'Father', 'Anna', 'Brother'],
        correctIndex: 2,
      },
    ],
    keywords: ['market', 'apple', 'bread', 'cheese', 'Saturday'],
  },
  {
    passage: `Today is Jack's birthday. He is eight years old. His friends come to his house. They eat cake and play games. Jack gets a new bicycle. He is very happy.`,
    passageTranslation: `Bugün Jack'ın doğum günü. O sekiz yaşında. Arkadaşları evine gelir. Pasta yerler ve oyun oynarlar. Jack yeni bir bisiklet alır. Çok mutlu.`,
    questions: [
      { question: 'How old is Jack?', options: ['Seven', 'Eight', 'Nine', 'Ten'], correctIndex: 1 },
      {
        question: 'What gift does Jack get?',
        options: ['A book', 'A toy', 'A bicycle', 'A ball'],
        correctIndex: 2,
      },
    ],
    keywords: ['birthday', 'cake', 'bicycle', 'happy', 'eight'],
  },
  {
    passage:
      'It is a rainy day. Mia cannot go outside. She stays at home and draws pictures. She draws a rainbow, a sun, and flowers. Her pictures are very colorful.',
    passageTranslation:
      'Yağmurlu bir gün. Mia dışarı çıkamıyor. Evde kalıp resim çizer. Gökkuşağı, güneş ve çiçekler çizer. Resimleri çok renkli.',
    questions: [
      {
        question: 'Why does Mia stay at home?',
        options: ['She is sick', 'It is rainy', 'She has homework', 'She is tired'],
        correctIndex: 1,
      },
      {
        question: 'What does Mia draw?',
        options: ['Animals', 'Cars', 'Rainbow and flowers', 'Houses'],
        correctIndex: 2,
      },
    ],
    keywords: ['rain', 'draw', 'rainbow', 'flower', 'colorful'],
  },
  {
    passage: `Leo has a pet turtle. The turtle's name is Slow. Slow lives in a small tank. Leo feeds Slow every morning. Slow likes lettuce and carrots.`,
    passageTranslation: `Leo'nun evcil bir kaplumbağası var. Kaplumbağanın adı Slow. Slow küçük bir tankta yaşar. Leo her sabah Slow'u besler. Slow marul ve havuç sever.`,
    questions: [
      {
        question: `What is the turtle's name?`,
        options: ['Fast', 'Lucky', 'Slow', 'Green'],
        correctIndex: 2,
      },
      {
        question: 'What does Slow eat?',
        options: ['Fish', 'Bread', 'Lettuce and carrots', 'Rice'],
        correctIndex: 2,
      },
    ],
    keywords: ['turtle', 'slow', 'carrot', 'morning'],
  },
  {
    passage:
      'My grandmother lives in a small village. She has chickens and a cow. She makes fresh bread every day. I visit her in the summer. I love her bread.',
    passageTranslation:
      'Büyükannem küçük bir köyde yaşar. Tavukları ve bir ineği var. Her gün taze ekmek yapar. Yazın onu ziyaret ederim. Ekmeğini severim.',
    questions: [
      {
        question: 'Where does the grandmother live?',
        options: ['In a city', 'In a village', 'Near the sea', 'In a forest'],
        correctIndex: 1,
      },
      {
        question: 'When does the child visit?',
        options: ['In winter', 'In spring', 'In summer', 'In autumn'],
        correctIndex: 2,
      },
    ],
    keywords: ['grandmother', 'village', 'bread', 'cow', 'summer'],
  },
  {
    passage:
      'The zoo is fun! There are lions, elephants, and monkeys. The monkeys are funny. They jump and climb trees. The elephant is very big. My favorite animal is the penguin.',
    passageTranslation:
      'Hayvanat bahçesi eğlenceli! Aslanlar, filler ve maymunlar var. Maymunlar komik. Zıplıyorlar ve ağaçlara tırmanıyorlar. Fil çok büyük. En sevdiğim hayvan penguen.',
    questions: [
      {
        question: 'What do the monkeys do?',
        options: ['Sleep', 'Jump and climb', 'Swim', 'Fly'],
        correctIndex: 1,
      },
      {
        question: 'What is the favorite animal?',
        options: ['Lion', 'Elephant', 'Monkey', 'Penguin'],
        correctIndex: 3,
      },
    ],
    keywords: ['lion', 'elephant', 'monkey', 'penguin', 'big'],
  },
  {
    passage:
      'Every morning, I wake up at seven. I brush my teeth and wash my face. Then I eat breakfast with my family. I drink milk and eat toast. After breakfast, I go to school.',
    passageTranslation:
      'Her sabah yedide uyanırım. Dişlerimi fırçalar ve yüzümü yıkarım. Sonra ailemle kahvaltı yaparım. Süt içer ve tost yerim. Kahvaltından sonra okula giderim.',
    questions: [
      {
        question: 'What time does the child wake up?',
        options: ['Six', 'Seven', 'Eight', 'Nine'],
        correctIndex: 1,
      },
      {
        question: 'What does the child drink for breakfast?',
        options: ['Juice', 'Water', 'Tea', 'Milk'],
        correctIndex: 3,
      },
    ],
    keywords: ['morning', 'seven', 'breakfast', 'milk', 'toast', 'school'],
  },
  {
    passage:
      'Sam and his dad go fishing on Sunday. They wake up early and drive to the lake. They sit by the water and wait. Sam catches a big fish! He is so proud.',
    passageTranslation:
      'Sam ve babası pazar günü balık tutmaya gider. Erken kalkıp göle araba ile giderler. Suyun kenarında oturup beklerler. Sam büyük bir balık yakalar! Çok gururlu.',
    questions: [
      {
        question: 'Where do they go fishing?',
        options: ['The river', 'The sea', 'The lake', 'The pool'],
        correctIndex: 2,
      },
      {
        question: 'How does Sam feel?',
        options: ['Sad', 'Angry', 'Tired', 'Proud'],
        correctIndex: 3,
      },
    ],
    keywords: ['fish', 'lake', 'Sunday', 'proud', 'big'],
  },
  {
    passage:
      'The school concert is today. Lily plays the piano. Tom plays the guitar. Sara sings a beautiful song. All the parents clap. The children are happy and proud.',
    passageTranslation:
      'Okul konseri bugün. Lily piyano çalar. Tom gitar çalar. Sara güzel bir şarkı söyler. Bütün anne babalar alkışlar. Çocuklar mutlu ve gururlu.',
    questions: [
      {
        question: 'What does Lily play?',
        options: ['Guitar', 'Drum', 'Piano', 'Violin'],
        correctIndex: 2,
      },
      {
        question: 'What does Sara do?',
        options: ['Plays guitar', 'Dances', 'Sings a song', 'Plays piano'],
        correctIndex: 2,
      },
    ],
    keywords: ['piano', 'guitar', 'sing', 'music'],
  },
  {
    passage:
      'My room is small but nice. I have a blue bed and a white desk. There are many books on my shelf. My favorite book is about dinosaurs. I read before I sleep.',
    passageTranslation:
      'Odam küçük ama güzel. Mavi bir yatağım ve beyaz bir masam var. Rafımda birçok kitap var. En sevdiğim kitap dinozorlar hakkında. Uyumadan önce okurum.',
    questions: [
      {
        question: 'What color is the bed?',
        options: ['Red', 'Green', 'Blue', 'White'],
        correctIndex: 2,
      },
      {
        question: 'What is the favorite book about?',
        options: ['Cars', 'Animals', 'Dinosaurs', 'Space'],
        correctIndex: 2,
      },
    ],
    keywords: ['bed', 'blue', 'book', 'dinosaur', 'read'],
  },
  {
    passage:
      'It is autumn. The leaves change color. They become red, orange, and yellow. The wind blows and the leaves fall down. We collect beautiful leaves in the park.',
    passageTranslation:
      'Sonbahar. Yapraklar renk değiştirir. Kırmızı, turuncu ve sarı olurlar. Rüzgar eser ve yapraklar düşer. Parkta güzel yapraklar toplarız.',
    questions: [
      {
        question: 'What season is it?',
        options: ['Spring', 'Summer', 'Autumn', 'Winter'],
        correctIndex: 2,
      },
      {
        question: 'What colors are the leaves?',
        options: ['Blue and green', 'Red, orange and yellow', 'Purple and pink', 'Black and white'],
        correctIndex: 1,
      },
    ],
    keywords: ['autumn', 'red', 'orange', 'yellow', 'park'],
  },
  {
    passage:
      'My best friend is Ava. She has brown hair and green eyes. We play together after school. We like to ride our bicycles. On rainy days, we play board games at my house.',
    passageTranslation:
      'En iyi arkadaşım Ava. Kahverengi saçları ve yeşil gözleri var. Okuldan sonra birlikte oynarız. Bisiklet sürmeyi severiz. Yağmurlu günlerde evimde masa oyunu oynarız.',
    questions: [
      {
        question: `What color are Ava's eyes?`,
        options: ['Blue', 'Brown', 'Green', 'Black'],
        correctIndex: 2,
      },
      {
        question: 'What do they do on rainy days?',
        options: ['Play football', 'Watch TV', 'Play board games', 'Go swimming'],
        correctIndex: 2,
      },
    ],
    keywords: ['friend', 'bicycle', 'green', 'rain', 'game'],
  },
  {
    passage:
      'The museum is very big. There are dinosaur bones and old paintings. I see a big T-Rex skeleton. It is amazing! My father takes photos. We have a great day.',
    passageTranslation:
      'Müze çok büyük. Dinozor kemikleri ve eski resimler var. Büyük bir T-Rex iskeleti görüyorum. Harika! Babam fotoğraf çeker. Harika bir gün geçiririz.',
    questions: [
      {
        question: 'What is in the museum?',
        options: ['Cars', 'Dinosaur bones', 'Animals', 'Food'],
        correctIndex: 1,
      },
      {
        question: 'Who takes photos?',
        options: ['Mother', 'Sister', 'Father', 'Teacher'],
        correctIndex: 2,
      },
    ],
    keywords: ['dinosaur', 'big', 'amazing', 'camera'],
  },
  {
    passage:
      'On Saturday, we have a picnic in the park. Mom makes sandwiches and salad. Dad brings a blanket and juice. I play with my brother. We fly a kite. The kite goes very high!',
    passageTranslation:
      'Cumartesi parkta piknik yaparız. Anne sandviç ve salata yapar. Baba battaniye ve meyve suyu getirir. Kardeşimle oynarım. Uçurtma uçururuz. Uçurtma çok yükseğe çıkar!',
    questions: [
      {
        question: 'What does Mom make?',
        options: ['Pizza', 'Sandwiches and salad', 'Cake', 'Soup'],
        correctIndex: 1,
      },
      {
        question: 'What do the children fly?',
        options: ['A balloon', 'A plane', 'A kite', 'A bird'],
        correctIndex: 2,
      },
    ],
    keywords: ['picnic', 'sandwich', 'salad', 'kite', 'park'],
  },
  {
    passage:
      'The fireman comes to our school today. He wears a yellow helmet and a big coat. He tells us about fire safety. We learn to stop, drop, and roll. He is very brave.',
    passageTranslation:
      'Bugün itfaiyeci okulumuza gelir. Sarı bir kask ve büyük bir palto giyer. Bize yangın güvenliği anlatır. Dur, yere düş ve yuvarlan öğreniriz. O çok cesur.',
    questions: [
      {
        question: 'What color is the helmet?',
        options: ['Red', 'Blue', 'Yellow', 'White'],
        correctIndex: 2,
      },
      {
        question: 'What does the fireman teach?',
        options: ['Math', 'Fire safety', 'English', 'Music'],
        correctIndex: 1,
      },
    ],
    keywords: ['firefighter', 'brave', 'yellow', 'hat', 'school'],
  },
  {
    passage:
      'My cat Luna loves boxes. She sits in big boxes and small boxes. She sleeps in shoe boxes. One day, I give her a very big box. She jumps inside and falls asleep. Silly cat!',
    passageTranslation:
      'Kedim Luna kutuları sever. Büyük kutulara ve küçük kutulara oturur. Ayakkabı kutularında uyur. Bir gün ona çok büyük bir kutu veririm. İçine atlayıp uyur. Aptal kedi!',
    questions: [
      {
        question: `What is the cat's name?`,
        options: ['Max', 'Luna', 'Kitty', 'Star'],
        correctIndex: 1,
      },
      {
        question: 'What does Luna love?',
        options: ['Balls', 'Boxes', 'Toys', 'Fish'],
        correctIndex: 1,
      },
    ],
    keywords: ['cat', 'box', 'big', 'small', 'sleep'],
  },
  {
    passage:
      'We go camping near the mountain. We set up a tent. At night, we make a fire and cook hot dogs. We look at the stars. They are so bright! I see the moon too. It is beautiful.',
    passageTranslation:
      'Dağın yakınında kamp yaparız. Çadır kurarız. Gece ateş yakar ve sosisli pişiririz. Yıldızlara bakarız. Çok parlaklar! Ayı da görürüm. Çok güzel.',
    questions: [
      {
        question: 'Where do they go camping?',
        options: ['By the sea', 'Near the mountain', 'In the city', 'At the lake'],
        correctIndex: 1,
      },
      {
        question: 'What do they see at night?',
        options: ['Birds', 'Clouds', 'Stars and moon', 'Planes'],
        correctIndex: 2,
      },
    ],
    keywords: ['mountain', 'star', 'moon', 'night', 'beautiful'],
  },
  {
    passage:
      'Today we have a sports day at school. I run in the race and come second. My friend Ali wins the long jump. Our team plays football and we win! Everyone gets a medal. What a great day!',
    passageTranslation:
      'Bugün okulda spor günümüz var. Yarışta koşup ikinci olurum. Arkadaşım Ali uzun atlamayı kazanır. Takımımız futbol oynar ve kazanırız! Herkes madalya alır. Ne harika bir gün!',
    questions: [
      {
        question: 'What place does the child get in the race?',
        options: ['First', 'Second', 'Third', 'Last'],
        correctIndex: 1,
      },
      {
        question: 'What does everyone get?',
        options: ['A trophy', 'A medal', 'A prize', 'A certificate'],
        correctIndex: 1,
      },
    ],
    keywords: ['football', 'run', 'win', 'team', 'second'],
  },
  {
    passage:
      'I am learning to cook. Today I make a sandwich. I put butter on the bread. Then I add cheese and tomato. I cut it in half. My sandwich looks good! Mom says well done.',
    passageTranslation:
      'Yemek yapmayı öğreniyorum. Bugün sandviç yapıyorum. Ekmeğe tereyağı sürerim. Sonra peynir ve domates koyarım. İkiye bölerim. Sandviçim güzel görünüyor! Anne aferin der.',
    questions: [
      {
        question: 'What does the child make?',
        options: ['Pizza', 'A cake', 'A sandwich', 'Soup'],
        correctIndex: 2,
      },
      {
        question: 'What goes on the bread first?',
        options: ['Cheese', 'Tomato', 'Butter', 'Lettuce'],
        correctIndex: 2,
      },
    ],
    keywords: ['sandwich', 'bread', 'butter', 'cheese'],
  },
  {
    passage:
      'The library is my favorite place. It is very quiet there. I can read many books. The librarian is kind. She helps me find books about space. I want to learn about planets.',
    passageTranslation:
      'Kütüphane en sevdiğim yer. Orası çok sessiz. Birçok kitap okuyabilirim. Kütüphaneci nazik. Uzay hakkında kitap bulmama yardım eder. Gezegenler hakkında öğrenmek istiyorum.',
    questions: [
      {
        question: 'How is the library?',
        options: ['Loud', 'Quiet', 'Dark', 'Small'],
        correctIndex: 1,
      },
      {
        question: 'What does the child want to learn about?',
        options: ['Animals', 'Cars', 'Planets', 'Food'],
        correctIndex: 2,
      },
    ],
    keywords: ['library', 'book', 'quiet', 'planet', 'kind'],
  },
  {
    passage:
      'We have a new baby in our family. His name is Ozan. He is very small. He sleeps a lot and cries sometimes. I help my mom. I sing songs to Ozan. He smiles when I sing.',
    passageTranslation: `Ailemizde yeni bir bebek var. Adı Ozan. Çok küçük. Çok uyur ve bazen ağlar. Anneme yardım ederim. Ozan'a şarkılar söylerim. Söylediğimde gülümser.`,
    questions: [
      {
        question: `What is the baby's name?`,
        options: ['Ali', 'Ozan', 'Can', 'Efe'],
        correctIndex: 1,
      },
      {
        question: 'What does the baby do when hearing songs?',
        options: ['Cries', 'Sleeps', 'Smiles', 'Laughs'],
        correctIndex: 2,
      },
    ],
    keywords: ['baby', 'small', 'sing', 'smile', 'family'],
  },
  {
    passage:
      'The robot can do many things. It can dance, walk, and talk. It says hello in five languages. The robot is silver and has blue eyes. It is my favorite toy. I play with it every day.',
    passageTranslation:
      'Robot birçok şey yapabilir. Dans edebilir, yürüyebilir ve konuşabilir. Beş dilde merhaba der. Robot gümüş renkli ve mavi gözlü. En sevdiğim oyuncak. Her gün onunla oynarım.',
    questions: [
      {
        question: `What color are the robot's eyes?`,
        options: ['Red', 'Green', 'Blue', 'Yellow'],
        correctIndex: 2,
      },
      {
        question: 'How many languages does the robot speak?',
        options: ['Two', 'Three', 'Four', 'Five'],
        correctIndex: 3,
      },
    ],
    keywords: ['robot', 'dance', 'blue', 'toy', 'five'],
  },
  {
    passage:
      'Today is a snowy day. We put on our coats and gloves. We go outside and make a snowman. We use a carrot for the nose and buttons for the eyes. Our snowman is tall and round!',
    passageTranslation:
      'Bugün karlı bir gün. Paltolarımızı ve eldivenlerimizi giyeriz. Dışarı çıkıp kardan adam yaparız. Burun için havuç, gözler için düğme kullanırız. Kardan adamımız uzun ve yuvarlak!',
    questions: [
      {
        question: 'What do they use for the nose?',
        options: ['A stick', 'A carrot', 'A stone', 'A ball'],
        correctIndex: 1,
      },
      {
        question: 'What do they put on before going outside?',
        options: ['Hats', 'Coats and gloves', 'Shoes', 'Scarves'],
        correctIndex: 1,
      },
    ],
    keywords: ['snow', 'coat', 'gloves', 'carrot', 'round'],
  },
  {
    passage:
      'My uncle lives in Japan. He sends us photos of beautiful temples. The food in Japan is different. They eat sushi and rice with chopsticks. I want to visit Japan one day.',
    passageTranslation: `Amcam Japonya'da yaşar. Bize güzel tapınak fotoğrafları gönderir. Japonya'daki yemekler farklı. Çubuklarla suşi ve pilav yerler. Bir gün Japonya'yı ziyaret etmek istiyorum.`,
    questions: [
      {
        question: 'Where does the uncle live?',
        options: ['France', 'America', 'Japan', 'Turkey'],
        correctIndex: 2,
      },
      {
        question: 'What do people in Japan eat with?',
        options: ['Forks', 'Spoons', 'Hands', 'Chopsticks'],
        correctIndex: 3,
      },
    ],
    keywords: ['Japan', 'rice', 'beautiful', 'travel'],
  },
  {
    passage:
      'I take the bus to school. The bus is yellow and big. My bus driver is Mr. Ali. He is always friendly and says good morning to everyone. The ride takes fifteen minutes.',
    passageTranslation:
      'Okula otobüsle giderim. Otobüs sarı ve büyük. Otobüs şoförüm Ali Bey. Her zaman güler yüzlü ve herkese günaydın der. Yolculuk on beş dakika sürer.',
    questions: [
      {
        question: 'What color is the bus?',
        options: ['Red', 'Blue', 'Yellow', 'Green'],
        correctIndex: 2,
      },
      {
        question: 'How long is the ride?',
        options: ['Five minutes', 'Ten minutes', 'Fifteen minutes', 'Twenty minutes'],
        correctIndex: 2,
      },
    ],
    keywords: ['bus', 'yellow', 'school', 'morning', 'fifteen'],
  },
  {
    passage:
      'We have a big garden at home. There are apple trees and rose bushes. In spring, the roses bloom. They are red, pink, and white. Butterflies come to our garden. I love spring!',
    passageTranslation:
      'Evimizde büyük bir bahçe var. Elma ağaçları ve gül çalıları var. İlkbaharda güller çiçek açar. Kırmızı, pembe ve beyaz olurlar. Bahçemize kelebekler gelir. İlkbaharı severim!',
    questions: [
      {
        question: 'What trees are in the garden?',
        options: ['Orange', 'Lemon', 'Apple', 'Cherry'],
        correctIndex: 2,
      },
      {
        question: 'What comes to the garden?',
        options: ['Birds', 'Butterflies', 'Cats', 'Bees'],
        correctIndex: 1,
      },
    ],
    keywords: ['garden', 'apple', 'butterfly', 'red', 'pink', 'white'],
  },
  {
    passage:
      'I want to be a doctor when I grow up. Doctors help sick people. They wear white coats. My mom is a nurse at the hospital. She helps the doctors. The hospital is a very busy place.',
    passageTranslation:
      'Büyüyünce doktor olmak istiyorum. Doktorlar hasta insanlara yardım eder. Beyaz önlük giyerler. Annem hastanede hemşire. Doktorlara yardım eder. Hastane çok yoğun bir yer.',
    questions: [
      {
        question: 'What does the child want to be?',
        options: ['A nurse', 'A teacher', 'A doctor', 'A pilot'],
        correctIndex: 2,
      },
      {
        question: `What is the mother's job?`,
        options: ['Doctor', 'Nurse', 'Teacher', 'Chef'],
        correctIndex: 1,
      },
    ],
    keywords: ['doctor', 'nurse', 'hospital', 'help people', 'white'],
  },
  {
    passage:
      'Friday is pizza night at our house. Dad makes the dough. I put tomato sauce on top. My sister adds the cheese. We put it in the oven for ten minutes. Homemade pizza is the best!',
    passageTranslation:
      'Cuma evimizde pizza gecesi. Baba hamuru yapar. Ben üstüne domates sosu koyarım. Kız kardeşim peynir ekler. On dakika fırına koyarız. Ev yapımı pizza en iyisi!',
    questions: [
      {
        question: 'When is pizza night?',
        options: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
        correctIndex: 2,
      },
      {
        question: 'Who adds the cheese?',
        options: ['Mom', 'Dad', 'The child', 'The sister'],
        correctIndex: 3,
      },
    ],
    keywords: ['pizza', 'Friday', 'cheese', 'ten', 'oven'],
  },
  {
    passage:
      'The weather is very hot today. We go to the swimming pool. The water is cool and nice. I can swim twenty meters now. My little brother uses a float. We stay at the pool for two hours.',
    passageTranslation:
      'Bugün hava çok sıcak. Yüzme havuzuna gideriz. Su serin ve güzel. Artık yirmi metre yüzebiliyorum. Küçük kardeşim şamandıra kullanır. Havuzda iki saat kalırız.',
    questions: [
      {
        question: 'Why do they go to the pool?',
        options: ['It is cold', 'It is rainy', 'It is very hot', 'It is windy'],
        correctIndex: 2,
      },
      {
        question: 'How far can the child swim?',
        options: ['Five meters', 'Ten meters', 'Twenty meters', 'Fifty meters'],
        correctIndex: 2,
      },
    ],
    keywords: ['swim', 'hot', 'cool', 'twenty', 'water'],
  },
  {
    passage: `There is a big clock tower in our city. It is very old and tall. The clock rings every hour. We can hear it from our school. At twelve o'clock, it rings twelve times. I count the rings every day.`,
    passageTranslation:
      'Şehrimizde büyük bir saat kulesi var. Çok eski ve uzun. Saat her saat başı çalar. Okulumuzdan duyabiliriz. Saat on ikide on iki kez çalar. Her gün çalma sayılarını sayarım.',
    questions: [
      {
        question: 'How often does the clock ring?',
        options: ['Every day', 'Every minute', 'Every hour', 'Every week'],
        correctIndex: 2,
      },
      {
        question: 'How many times does it ring at twelve?',
        options: ['Six', 'Ten', 'Twelve', 'Twenty'],
        correctIndex: 2,
      },
    ],
    keywords: ["o'clock", 'clock', 'tower', 'twelve', 'old'],
  },

  // ──── INFERENTIAL & EVALUATIVE QUESTION PASSAGES ────

  {
    passage:
      'Emma has an umbrella and a raincoat today. She also wears her boots. Her mother gives her a warm drink before school. Emma sees puddles on the road.',
    passageTranslation:
      'Emma bugün şemsiye ve yağmurluk aldı. Çizmelerini de giydi. Annesi okuldan önce sıcak bir içecek verdi. Emma yolda su birikintileri gördü.',
    questions: [
      {
        question: 'What is the weather probably like?',
        options: ['Sunny', 'Snowy', 'Rainy', 'Hot'],
        correctIndex: 2,
      },
      {
        question: 'Why does Emma wear boots?',
        options: ['She likes boots', 'To stay dry', 'To look nice', 'For sports'],
        correctIndex: 1,
      },
      {
        question: 'How does Emma feel about going to school?',
        options: ['She is scared', 'She is angry', 'She is prepared', 'She is lost'],
        correctIndex: 2,
      },
    ],
    keywords: ['umbrella', 'rain', 'boots', 'warm', 'puddle'],
  },
  {
    passage:
      'Ali walks very slowly today. He yawns many times in class. He puts his head on his desk. His teacher asks: "Are you okay, Ali?" Ali says he went to bed very late last night.',
    passageTranslation:
      'Ali bugün çok yavaş yürüyor. Sınıfta birçok kez esnedi. Başını sırasına koydu. Öğretmeni sorar: "İyi misin Ali?" Ali dün gece çok geç yattığını söyler.',
    questions: [
      {
        question: 'How does Ali feel?',
        options: ['Happy', 'Tired', 'Angry', 'Excited'],
        correctIndex: 1,
      },
      {
        question: 'Why is Ali tired?',
        options: ['He ran a lot', 'He is sick', 'He slept late', 'He is hungry'],
        correctIndex: 2,
      },
      {
        question: 'What should Ali do tonight?',
        options: ['Watch TV', 'Go to bed early', 'Play games', 'Eat more'],
        correctIndex: 1,
      },
    ],
    keywords: ['tired', 'sleep', 'school', 'yawn', 'late'],
  },
  {
    passage:
      'The squirrel runs up the tree with nuts in its mouth. It hides them in a small hole. Then it finds more nuts and brings them too. The leaves on the tree are orange and red.',
    passageTranslation:
      'Sincap ağzında fıstıklarla ağaca koşar. Onları küçük bir deliğe saklar. Sonra daha fazla fıstık bulur ve onları da getirir. Ağaçtaki yapraklar turuncu ve kırmızı.',
    questions: [
      {
        question: 'What season is it probably?',
        options: ['Spring', 'Summer', 'Autumn', 'Winter'],
        correctIndex: 2,
      },
      {
        question: 'Why does the squirrel hide nuts?',
        options: [
          'To play a game',
          'To save food for later',
          'Because it is scared',
          'For its baby',
        ],
        correctIndex: 1,
      },
    ],
    keywords: ['autumn', 'tree', 'orange', 'red', 'animal'],
  },
  {
    passage:
      'Mia sees a cake with candles and balloons in the living room. Her friends come to her house. They bring presents in colorful boxes. Everyone sings a song to her.',
    passageTranslation:
      'Mia oturma odasında mumlu pasta ve balonlar görür. Arkadaşları evine gelir. Renkli kutularda hediyeler getirirler. Herkes ona bir şarkı söyler.',
    questions: [
      {
        question: 'What is happening?',
        options: ['A school day', 'A birthday party', 'A holiday', 'A picnic'],
        correctIndex: 1,
      },
      {
        question: 'How does Mia probably feel?',
        options: ['Sad', 'Bored', 'Happy', 'Scared'],
        correctIndex: 2,
      },
      {
        question: 'What song do they probably sing?',
        options: ['A sad song', 'Happy Birthday', 'A school song', 'A lullaby'],
        correctIndex: 1,
      },
    ],
    keywords: ['birthday', 'cake', 'balloon', 'happy', 'friend'],
  },
  {
    passage:
      'Tom looks at the sky every night with his telescope. He draws pictures of stars in his notebook. He reads many books about planets. He says, "I want to go to Mars one day!"',
    passageTranslation:
      'Tom her gece teleskobuyla gökyüzüne bakar. Defterine yıldız resimleri çizer. Gezegenler hakkında birçok kitap okur. "Bir gün Mars\'a gitmek istiyorum!" der.',
    questions: [
      {
        question: 'What does Tom want to be when he grows up?',
        options: ['A teacher', 'An astronaut', 'A painter', 'A doctor'],
        correctIndex: 1,
      },
      {
        question: 'Why does Tom read about planets?',
        options: [
          'For school homework',
          'Because he loves space',
          'His mom tells him to',
          'He is bored',
        ],
        correctIndex: 1,
      },
    ],
    keywords: ['star', 'planet', 'Mars', 'space', 'astronaut'],
  },
  {
    passage:
      'There is a new boy in our class. He sits alone at lunch. He does not talk to anyone. He looks at the floor a lot. I go to him and say "Hi! My name is Ali."',
    passageTranslation:
      'Sınıfımızda yeni bir çocuk var. Öğle yemeğinde yalnız oturuyor. Kimseyle konuşmuyor. Yere çok bakıyor. Yanına gidip "Merhaba! Benim adım Ali" diyorum.',
    questions: [
      {
        question: 'How does the new boy feel?',
        options: ['Happy', 'Shy or lonely', 'Angry', 'Excited'],
        correctIndex: 1,
      },
      {
        question: 'Why does Ali talk to him?',
        options: [
          'The teacher says so',
          'To be kind and friendly',
          'To get his food',
          'Because he is bored',
        ],
        correctIndex: 1,
      },
      {
        question: 'What will probably happen next?',
        options: [
          'They will fight',
          'They will become friends',
          'The boy will leave',
          'Ali will walk away',
        ],
        correctIndex: 1,
      },
    ],
    keywords: ['friend', 'kind', 'shy', 'hello', 'school'],
  },
  {
    passage:
      'Grandma puts on her glasses. She opens a big book. All the grandchildren sit around her. She begins: "Once upon a time..." The room becomes very quiet.',
    passageTranslation:
      'Büyükanne gözlüğünü takar. Büyük bir kitap açar. Tüm torunlar etrafına oturur. Başlar: "Bir varmış bir yokmuş..." Oda çok sessiz olur.',
    questions: [
      {
        question: 'What is Grandma going to do?',
        options: ['Cook food', 'Read a story', 'Sing a song', 'Watch TV'],
        correctIndex: 1,
      },
      {
        question: 'Why does the room become quiet?',
        options: [
          'Everyone is sleeping',
          'Everyone is listening',
          'Everyone left',
          'The TV is off',
        ],
        correctIndex: 1,
      },
    ],
    keywords: ['grandmother', 'book', 'read', 'quiet', 'story'],
  },
  {
    passage:
      'The dog is barking at the door. It runs to the window and back to the door. It wags its tail very fast. Then we hear a car in the driveway. The dog jumps up and down.',
    passageTranslation:
      'Köpek kapıya havlıyor. Pencereye koşar ve kapıya geri döner. Kuyruğunu çok hızlı sallar. Sonra garaj yolunda bir araba sesi duyulur. Köpek zıplar.',
    questions: [
      {
        question: 'Why is the dog excited?',
        options: [
          'It is hungry',
          'Someone is coming home',
          'It sees a cat',
          'It wants to go outside',
        ],
        correctIndex: 1,
      },
      {
        question: 'How does the dog feel?',
        options: ['Scared', 'Sad', 'Happy and excited', 'Angry'],
        correctIndex: 2,
      },
    ],
    keywords: ['dog', 'happy', 'car', 'home', 'excited'],
  },
  {
    passage:
      'Ela picks up rubbish from the ground in the park. She also brings her own bottle instead of buying plastic ones. She turns off lights when she leaves a room. She says, "We need to protect our planet."',
    passageTranslation:
      'Ela parkta yerden çöp toplar. Plastik almak yerine kendi şişesini getirir. Odadan çıkarken ışıkları kapatır. "Gezegenimizi korumamız lazım" der.',
    questions: [
      {
        question: 'What does Ela care about?',
        options: ['Fashion', 'The environment', 'Sports', 'Music'],
        correctIndex: 1,
      },
      {
        question: 'Why does she carry her own bottle?',
        options: ['It is pretty', 'To save money', 'To use less plastic', 'Her mom says so'],
        correctIndex: 2,
      },
      {
        question: 'What can you do to help like Ela?',
        options: ['Buy more plastic', 'Leave lights on', 'Turn off lights and recycle', 'Nothing'],
        correctIndex: 2,
      },
    ],
    keywords: ['planet', 'nature', 'protect', 'clean', 'bottle'],
  },
  {
    passage:
      'Can has a math test tomorrow. He does not study. He plays video games all evening. The next morning, he looks at the test paper. He does not know the answers. His eyes look worried.',
    passageTranslation:
      "Can'ın yarın matematik sınavı var. Çalışmıyor. Akşam boyunca video oyunu oynuyor. Ertesi sabah sınav kağıdına bakıyor. Cevapları bilmiyor. Gözleri endişeli görünüyor.",
    questions: [
      {
        question: 'Why does Can not know the answers?',
        options: ['The test is too hard', 'He did not study', 'He is sick', 'He forgot his pencil'],
        correctIndex: 1,
      },
      {
        question: 'What lesson can we learn from this story?',
        options: [
          'Games are bad',
          'Tests are scary',
          'It is important to study before a test',
          'Math is hard',
        ],
        correctIndex: 2,
      },
    ],
    keywords: ['study', 'exam', 'lesson', 'homework', 'school'],
  },
];
