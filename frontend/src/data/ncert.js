/**
 * NCERT chapter mapping for EduBridge.
 * Keys: subject → grade (1-12) → array of chapter names (1-indexed position = chapter number).
 * Used to give the AI tutor NCERT curriculum context.
 */

export const NCERT_CHAPTERS = {
  Math: {
    1:  ['Shapes and Space', 'Numbers 1–9', 'Addition', 'Subtraction', 'Numbers 10–20', 'Time', 'Measurement', 'Numbers 21–99', 'Data Handling', 'Patterns'],
    2:  ['What is Long, What is Round?', 'Counting in Groups', 'How Much Can You Carry?', 'Counting in Tens', 'Patterns', 'Footprints', 'Jugs and Mugs', 'Tens and Ones', 'My Funday', 'Add our Points', 'Lines and Lines', 'Give and Take', 'The Longest Step', 'Birds Come, Birds Go', 'How Many Ponytails?'],
    3:  ['Where to Look From?', 'Fun with Numbers', 'Give and Take', 'Long and Short', 'Shapes and Designs', 'Fun with Give and Take', 'Time Goes On', 'Who is Heavier?', 'How Many Times?', 'Play with Patterns', 'Jugs and Mugs', 'Can We Share?', 'Smart Charts', 'Rupees and Paise'],
    4:  ['Building with Bricks', 'Long and Short', 'A Trip to Bhopal', 'Tick Tick Tick', 'The Way the World Looks', 'The Junk Seller', 'Jugs and Mugs', 'Carts and Wheels', 'Halves and Quarters', 'Play with Patterns', 'Tables and Shares', 'How Heavy? How Light?', 'Fields and Fences', 'Smart Charts'],
    5:  ['The Fish Tale', 'Shapes and Angles', 'How Many Squares?', 'Parts and Wholes', 'Does it Look the Same?', 'Be My Multiple, I\'ll be Your Factor', 'Can You See the Pattern?', 'Mapping Your Way', 'Boxes and Sketches', 'Tenths and Hundredths', 'Area and its Boundary', 'Smart Charts', 'Ways to Multiply and Divide', 'How Big? How Heavy?'],
    6:  ['Knowing Our Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometrical Ideas', 'Understanding Elementary Shapes', 'Integers', 'Fractions', 'Decimals', 'Data Handling', 'Mensuration', 'Algebra', 'Ratio and Proportion', 'Symmetry', 'Practical Geometry'],
    7:  ['Integers', 'Fractions and Decimals', 'Data Handling', 'Simple Equations', 'Lines and Angles', 'The Triangle and its Properties', 'Congruence of Triangles', 'Comparing Quantities', 'Rational Numbers', 'Practical Geometry', 'Perimeter and Area', 'Algebraic Expressions', 'Exponents and Powers', 'Symmetry', 'Visualising Solid Shapes'],
    8:  ['Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals', 'Data Handling', 'Squares and Square Roots', 'Cubes and Cube Roots', 'Comparing Quantities', 'Algebraic Expressions and Identities', 'Mensuration', 'Exponents and Powers', 'Direct and Inverse Proportions', 'Factorisation', 'Introduction to Graphs', 'Playing with Numbers'],
    9:  ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables', 'Introduction to Euclid\'s Geometry', 'Lines and Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Heron\'s Formula', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    10: ['Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry', 'Some Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability'],
    11: ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Complex Numbers and Quadratic Equations', 'Linear Inequalities', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series', 'Straight Lines', 'Conic Sections', 'Introduction to Three Dimensional Geometry', 'Limits and Derivatives', 'Statistics', 'Probability'],
    12: ['Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants', 'Continuity and Differentiability', 'Application of Derivatives', 'Integrals', 'Application of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'],
  },

  Science: {
    // Classes 1–5 use EVS (Environmental Studies) — no separate Science
    3:  ['Poonam\'s Day Out', 'The Plant Fairy', 'Water O Water', 'Our First School', 'Chhotu\'s House', 'Foods We Eat', 'Saying Without Speaking', 'Flying High', 'It\'s Raining', 'What is Cooking', 'From Here to There', 'Work We Do', 'Sharing Our Feelings', 'The Story of Food', 'Making Pots', 'Games We Play', 'Here Comes a Letter', 'A House Like This', 'Our Friends Animals', 'Drop by Drop', 'Families Can Be Different', 'Left Right', 'A Beautiful Cloth', 'Web of Life'],
    4:  ['Going to School', 'Ear to Ear', 'A Day with Nandu', 'The Story of Amrita', 'Anita and the Honeybees', 'Omana\'s Journey', 'From the Window', 'Reaching Grandmother\'s House', 'Changing Families', 'Hu Tu Tu, Hu Tu Tu', 'The Valley of Flowers', 'Changing Times', 'A River\'s Tale', 'Basva\'s Farm', 'From Market to Home', 'A Busy Month', 'Nandita in Mumbai', 'Too Much Water, Too Little Water', 'Abdul in the Garden', 'Eating Together', 'Food and Fun', 'The World in My Home', 'Pocham\'s Work', 'Home and Abroad'],
    5:  ['Super Senses', 'A Snake Charmer\'s Story', 'From Tasting to Digesting', 'Mangoes Round the Year', 'Seeds and Seeds', 'Every Drop Counts', 'Experiments with Water', 'A Treat for Mosquitoes', 'Up You Go!', 'Walls Tell Stories', 'Sunita in Space', 'What if it Finishes?', 'A Shelter So High!', 'When the Earth Shook!', 'Blow Hot, Blow Cold', 'Who will do this Work?', 'Across the Wall', 'No Place for Us?', 'A Seed Tells a Farmer\'s Story', 'Whose Forests?', 'Like Father, Like Daughter', 'On the Move Again'],
    6:  ['Food: Where Does it Come From?', 'Components of Food', 'Fibre to Fabric', 'Sorting Materials into Groups', 'Separation of Substances', 'Changes Around Us', 'Getting to Know Plants', 'Body Movements', 'The Living Organisms and Their Surroundings', 'Motion and Measurement of Distances', 'Light, Shadows and Reflections', 'Electricity and Circuits', 'Fun with Magnets', 'Water', 'Air Around Us', 'Garbage In, Garbage Out'],
    7:  ['Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat', 'Acids, Bases and Salts', 'Physical and Chemical Changes', 'Weather, Climate and Adaptations of Animals to Climate', 'Winds, Storms and Cyclones', 'Soil', 'Respiration in Organisms', 'Transportation in Animals and Plants', 'Reproduction in Plants', 'Motion and Time', 'Electric Current and its Effects', 'Light', 'Water: A Precious Resource', 'Forests: Our Lifeline', 'Wastewater Story'],
    8:  ['Crop Production and Management', 'Microorganisms: Friend and Foe', 'Synthetic Fibres and Plastics', 'Materials: Metals and Non-Metals', 'Coal and Petroleum', 'Combustion and Flame', 'Conservation of Plants and Animals', 'Cell Structure and Functions', 'Reproduction in Animals', 'Reaching the Age of Adolescence', 'Force and Pressure', 'Friction', 'Sound', 'Chemical Effects of Electric Current', 'Some Natural Phenomena', 'Light', 'Stars and the Solar System', 'Pollution of Air and Water'],
    9:  ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound', 'Why Do We Fall Ill?', 'Natural Resources', 'Improvement in Food Resources'],
    10: ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Carbon and its Compounds', 'Periodic Classification of Elements', 'Life Processes', 'Control and Coordination', 'How do Organisms Reproduce?', 'Heredity and Evolution', 'Light — Reflection and Refraction', 'Human Eye and Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 'Sources of Energy', 'Our Environment', 'Sustainable Management of Natural Resources'],
    11: ['Physical World', 'Units and Measurement', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion', 'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'],
    12: ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics', 'Communication Systems'],
  },

  English: {
    1:  ['A Happy Child', 'Three Little Pigs', 'After a Bath', 'The Bubble, the Straw and the Shoe', 'One Little Kitten', 'Lalu and Peelu', 'A Kite', 'Mittu and the Yellow Mango', 'Clouds', 'Flying Man', 'I Am Lucky!', 'I Want', 'A Little Turtle', 'The Monkey and the Crocodile', 'If I Were an Apple', 'Our Tree', 'Murali\'s Mango Tree', 'Rain', 'The Grass is Green', 'The Hare and the Tortoise'],
    2:  ['First Day at School', 'Haldi\'s Adventure', 'I Am Lucky!', 'A Smile', 'Wind and Sun', 'Storm in the Garden', 'The Grasshopper and the Ant', 'Funny Bunny', 'The Mumbai Musicians', 'The Magic Porridge Pot', 'The Bear and the Field Mouse', 'Strange Talk'],
    3:  ['Good Morning', 'The Magic Garden', 'Bird Talk', 'Nina and the Baby Sparrows', 'Little by Little', 'The Enormous Turnip', 'Sea Song', 'The Yellow Butterfly', 'What\'s in the Mailbox?', 'Don\'t Tell', 'Trains', 'The Lying Robot', 'Stop That!', 'Poem'],
    4:  ['Wake Up!', 'Neha\'s Alarm Clock', 'Noses', 'The Little Fir Tree', 'Run!', 'Nasruddin\'s Aim', 'Why?', 'Alice in Wonderland', 'Don\'t be Afraid of the Dark', 'Helen Keller', 'The Donkey', 'The Scholar\'s Mother Tongue', 'Hiawatha', 'The Milkman\'s Cow', 'A Watering Rhyme', 'The Shop of Dreams', 'Books', 'Going to Buy a Book', 'I Had a Little Pony', 'The Giving Tree', 'Pinocchio'],
    5:  ['Ice-cream Man', 'Wonderful Waste!', 'Teamwork', 'Flying Together', 'My Shadow', 'Robinson Crusoe Discovers a Footprint', 'Crying', 'My Elder Brother', 'The Lazy Frog', 'Rip Van Winkle', 'Class Discussion', 'The Talkative Barber', 'Topsy-turvy Land', 'Gulliver\'s Travels', 'Nobody\'s Friend', 'The Little Bully', 'I Know an Old Lady Who Swallowed a Fly', 'Sing a Song of People', 'Around the World'],
    6:  ['Who Did Patrick\'s Homework?', 'How the Dog Found Himself a New Master!', 'Taro\'s Reward', 'An Indian — American Woman in Space: Kalpana Chawla', 'A Different Kind of School', 'Who I Am', 'Fair Play', 'A Game of Chance', 'Desert Animals', 'The Banyan Tree', 'A House, A Home', 'The Kite', 'The Quarrel', 'Beauty', 'Vocation', 'What if', 'Gull', 'Poem by Rabindranath Tagore'],
    7:  ['Three Questions', 'A Gift of Chappals', 'Gopal and the Hilsa Fish', 'The Ashes That Made Trees Bloom', 'Quality', 'Expert Detectives', 'The Invention of Vita-Wonk', 'Fire: Friend and Foe', 'A Bicycle in Good Repair', 'The Story of Cricket', 'The Squirrel', 'The Rebel', 'The Shed', 'Chivvy', 'Trees', 'Mystery of the Talking Fan', 'Dad and the Cat and the Tree', 'Meadow Surprises', 'Garden Snake'],
    8:  ['The Best Christmas Present in the World', 'The Tsunami', 'Glimpses of the Past', 'Bepin Choudhury\'s Lapse of Memory', 'The Summit Within', 'This is Jody\'s Fawn', 'A Visit to Cambridge', 'A Short Monsoon Diary', 'The Great Stone Face–I', 'The Great Stone Face–II', 'The Ant and the Cricket', 'Geography Lesson', 'Macavity: The Mystery Cat', 'The Last Bargain', 'The School Boy', 'The Duck and the Kangaroo', 'When I Have Fears', 'On the Grasshopper and Cricket', 'O Captain! My Captain!'],
    9:  ['The Fun They Had', 'The Sound of Music', 'The Little Girl', 'A Truly Beautiful Mind', 'The Snake and the Mirror', 'My Childhood', 'Packing', 'Reach for the Top', 'The Bond of Love', 'Kathmandu', 'If I Were You', 'The Road Not Taken', 'Wind', 'Rain on the Roof', 'The Lake Isle of Innisfree', 'A Legend of the Northland', 'No Men Are Foreign', 'The Duck and the Kangaroo', 'On Killing a Tree', 'The Snake Trying', 'A Slumber Did My Spirit Seal'],
    10: ['A Letter to God', 'Nelson Mandela: Long Walk to Freedom', 'Two Stories about Flying', 'From the Diary of Anne Frank', 'Glimpses of India', 'Mijbil the Otter', 'Madam Rides the Bus', 'The Sermon at Benares', 'The Proposal', 'Dust of Snow', 'Fire and Ice', 'A Tiger in the Zoo', 'How to Tell Wild Animals', 'The Ball Poem', 'Amanda!', 'Animals', 'The Trees', 'Fog', 'The Tale of Custard the Dragon', 'For Anne Gregory'],
    11: ['The Portrait of a Lady', 'We\'re Not Afraid to Die', 'Discovering Tut: The Saga Continues', 'Landscape of the Soul', 'The Ailing Planet: the Green Movement\'s Role', 'The Browning Version', 'The Adventure', 'Silk Road', 'Father to Son', 'A Photograph', 'The Voice of the Rain', 'The Laburnum Top', 'A Roadside Stand', 'Childhood', 'Poem by Keats'],
    12: ['The Last Lesson', 'Lost Spring', 'Deep Water', 'The Rattrap', 'Indigo', 'Poets and Pancakes', 'The Interview', 'Going Places', 'My Mother at Sixty-six', 'An Elementary School Classroom in a Slum', 'Keeping Quiet', 'A Thing of Beauty', 'A Roadside Stand', 'Aunt Jennifer\'s Tigers'],
  },
};

/** Returns subjects that have NCERT chapter data for the given grade. */
export function getSubjectsWithChapters(grade) {
  const g = Number(grade);
  return Object.entries(NCERT_CHAPTERS)
    .filter(([, byGrade]) => byGrade[g] && byGrade[g].length > 0)
    .map(([subject]) => subject);
}

/** Returns chapters for a given subject + grade, or [] if none. */
export function getChapters(subject, grade) {
  return NCERT_CHAPTERS[subject]?.[Number(grade)] ?? [];
}

/** Returns "Chapter N: Name" label for display. */
export function chapterLabel(index, name) {
  return `Chapter ${index + 1}: ${name}`;
}
