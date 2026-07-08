/* Nutrition data + calculator engine — pure data and math, no rendering.
   Food macros are typical/approximate reference values for common foods,
   not sourced from a live database — always shown to the user as estimates,
   for planning purposes only, not medical or dietary advice. */

const FOOD_DB = [
  { id: 'chicken_breast', name: 'Chicken breast, cooked', category: 'protein', serving: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6, tags: ['non-veg', 'high-protein'] },
  { id: 'egg', name: 'Egg, whole', category: 'protein', serving: '1 large', calories: 78, protein: 6, carbs: 0.6, fat: 5, tags: ['vegetarian', 'high-protein'] },
  { id: 'egg_white', name: 'Egg white', category: 'protein', serving: '1 large', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, tags: ['vegetarian'] },
  { id: 'salmon', name: 'Salmon, cooked', category: 'protein', serving: '100g', calories: 208, protein: 20, carbs: 0, fat: 13, tags: ['non-veg', 'high-protein'] },
  { id: 'paneer', name: 'Paneer', category: 'protein', serving: '100g', calories: 265, protein: 18, carbs: 6, fat: 20, tags: ['vegetarian', 'high-protein'] },
  { id: 'tofu', name: 'Tofu, firm', category: 'protein', serving: '100g', calories: 144, protein: 15, carbs: 3, fat: 9, tags: ['vegan', 'vegetarian', 'high-protein'] },
  { id: 'greek_yogurt', name: 'Greek yogurt, plain', category: 'protein', serving: '170g (1 cup)', calories: 100, protein: 17, carbs: 6, fat: 0.5, tags: ['vegetarian', 'high-protein'] },
  { id: 'whey_protein', name: 'Whey protein powder', category: 'protein', serving: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5, tags: ['vegetarian', 'high-protein'] },
  { id: 'lentils', name: 'Lentils (dal), cooked', category: 'protein', serving: '100g', calories: 116, protein: 9, carbs: 20, fat: 0.4, tags: ['vegan', 'vegetarian'] },
  { id: 'chickpeas', name: 'Chickpeas, cooked', category: 'protein', serving: '100g', calories: 164, protein: 9, carbs: 27, fat: 2.6, tags: ['vegan', 'vegetarian'] },
  { id: 'black_beans', name: 'Black beans, cooked', category: 'protein', serving: '100g', calories: 132, protein: 8.9, carbs: 24, fat: 0.5, tags: ['vegan', 'vegetarian'] },
  { id: 'cottage_cheese', name: 'Cottage cheese', category: 'protein', serving: '100g', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, tags: ['vegetarian', 'high-protein'] },
  { id: 'tempeh', name: 'Tempeh', category: 'protein', serving: '100g', calories: 195, protein: 20, carbs: 8, fat: 11, tags: ['vegan', 'vegetarian', 'high-protein'] },
  { id: 'turkey_breast', name: 'Turkey breast, cooked', category: 'protein', serving: '100g', calories: 135, protein: 30, carbs: 0, fat: 1, tags: ['non-veg', 'high-protein'] },
  { id: 'shrimp', name: 'Shrimp, cooked', category: 'protein', serving: '100g', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, tags: ['non-veg', 'high-protein'] },
  { id: 'tuna', name: 'Tuna, canned in water', category: 'protein', serving: '100g', calories: 116, protein: 26, carbs: 0, fat: 1, tags: ['non-veg', 'high-protein'] },
  { id: 'soy_milk', name: 'Soy milk', category: 'dairy', serving: '1 cup (240ml)', calories: 80, protein: 7, carbs: 4, fat: 4, tags: ['vegan', 'vegetarian'] },
  { id: 'white_rice', name: 'White rice, cooked', category: 'carb', serving: '100g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, tags: ['vegan', 'vegetarian'] },
  { id: 'brown_rice', name: 'Brown rice, cooked', category: 'carb', serving: '100g', calories: 123, protein: 2.7, carbs: 26, fat: 1, tags: ['vegan', 'vegetarian'] },
  { id: 'roti', name: 'Roti / chapati', category: 'carb', serving: '1 piece (~40g)', calories: 104, protein: 3, carbs: 18, fat: 2.5, tags: ['vegetarian'] },
  { id: 'oats', name: 'Oats, dry', category: 'carb', serving: '40g', calories: 150, protein: 5, carbs: 27, fat: 3, tags: ['vegan', 'vegetarian'] },
  { id: 'whole_wheat_bread', name: 'Whole wheat bread', category: 'carb', serving: '1 slice', calories: 82, protein: 4, carbs: 14, fat: 1, tags: ['vegetarian'] },
  { id: 'potato', name: 'Potato, boiled', category: 'carb', serving: '100g', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, tags: ['vegan', 'vegetarian'] },
  { id: 'sweet_potato', name: 'Sweet potato, baked', category: 'carb', serving: '100g', calories: 90, protein: 2, carbs: 21, fat: 0.1, tags: ['vegan', 'vegetarian'] },
  { id: 'quinoa', name: 'Quinoa, cooked', category: 'carb', serving: '100g', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, tags: ['vegan', 'vegetarian'] },
  { id: 'pasta', name: 'Pasta, cooked', category: 'carb', serving: '100g', calories: 131, protein: 5, carbs: 25, fat: 1.1, tags: ['vegetarian'] },
  { id: 'banana', name: 'Banana', category: 'fruit', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, tags: ['vegan', 'vegetarian'] },
  { id: 'almonds', name: 'Almonds', category: 'fat', serving: '28g (~23 nuts)', calories: 164, protein: 6, carbs: 6, fat: 14, tags: ['vegan', 'vegetarian'] },
  { id: 'peanut_butter', name: 'Peanut butter', category: 'fat', serving: '2 tbsp', calories: 190, protein: 7, carbs: 6, fat: 16, tags: ['vegan', 'vegetarian'] },
  { id: 'olive_oil', name: 'Olive oil', category: 'fat', serving: '1 tbsp', calories: 119, protein: 0, carbs: 0, fat: 14, tags: ['vegan', 'vegetarian'] },
  { id: 'avocado', name: 'Avocado', category: 'fat', serving: 'half', calories: 160, protein: 2, carbs: 8.5, fat: 15, tags: ['vegan', 'vegetarian'] },
  { id: 'walnuts', name: 'Walnuts', category: 'fat', serving: '28g', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, tags: ['vegan', 'vegetarian'] },
  { id: 'chia_seeds', name: 'Chia seeds', category: 'fat', serving: '28g', calories: 137, protein: 4.4, carbs: 12, fat: 8.6, tags: ['vegan', 'vegetarian'] },
  { id: 'broccoli', name: 'Broccoli, cooked', category: 'veggie', serving: '100g', calories: 35, protein: 2.4, carbs: 7, fat: 0.4, tags: ['vegan', 'vegetarian'] },
  { id: 'spinach', name: 'Spinach, cooked', category: 'veggie', serving: '100g', calories: 23, protein: 3, carbs: 3.6, fat: 0.3, tags: ['vegan', 'vegetarian'] },
  { id: 'mixed_greens', name: 'Mixed salad greens', category: 'veggie', serving: '100g', calories: 20, protein: 1.4, carbs: 3.6, fat: 0.2, tags: ['vegan', 'vegetarian'] },
  { id: 'bell_pepper', name: 'Bell pepper', category: 'veggie', serving: '100g', calories: 31, protein: 1, carbs: 6, fat: 0.3, tags: ['vegan', 'vegetarian'] },
  { id: 'cauliflower', name: 'Cauliflower, cooked', category: 'veggie', serving: '100g', calories: 25, protein: 2, carbs: 5, fat: 0.3, tags: ['vegan', 'vegetarian'] },
  { id: 'apple', name: 'Apple', category: 'fruit', serving: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, tags: ['vegan', 'vegetarian'] },
  { id: 'orange', name: 'Orange', category: 'fruit', serving: '1 medium', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, tags: ['vegan', 'vegetarian'] },
  { id: 'blueberries', name: 'Blueberries', category: 'fruit', serving: '100g', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, tags: ['vegan', 'vegetarian'] },
  { id: 'mango', name: 'Mango', category: 'fruit', serving: '100g', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, tags: ['vegan', 'vegetarian'] },
  { id: 'milk_whole', name: 'Milk, whole', category: 'dairy', serving: '1 cup (240ml)', calories: 149, protein: 8, carbs: 12, fat: 8, tags: ['vegetarian'] },
  { id: 'milk_skim', name: 'Milk, skim', category: 'dairy', serving: '1 cup (240ml)', calories: 83, protein: 8, carbs: 12, fat: 0.2, tags: ['vegetarian'] },
  { id: 'cheddar', name: 'Cheddar cheese', category: 'dairy', serving: '28g', calories: 113, protein: 7, carbs: 0.4, fat: 9, tags: ['vegetarian'] }
];

function findFood(id) { return FOOD_DB.find(f => f.id === id); }

function computeIngredientsMacros(ingredients) {
  return ingredients.reduce((acc, ing) => {
    const food = findFood(ing.foodId);
    if (!food) return acc;
    acc.calories += food.calories * ing.qty;
    acc.protein += food.protein * ing.qty;
    acc.carbs += food.carbs * ing.qty;
    acc.fat += food.fat * ing.qty;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

const RAW_RECIPES = [
  { id: 'r_chicken_rice_broccoli', name: 'Grilled chicken, rice & broccoli', tags: ['non-veg', 'high-protein', 'cutting-friendly'], ingredients: [{ foodId: 'chicken_breast', qty: 1.5 }, { foodId: 'brown_rice', qty: 1 }, { foodId: 'broccoli', qty: 1.5 }] },
  { id: 'r_paneer_tikka_bowl', name: 'Paneer tikka bowl', tags: ['vegetarian', 'high-protein'], ingredients: [{ foodId: 'paneer', qty: 1 }, { foodId: 'brown_rice', qty: 1 }, { foodId: 'bell_pepper', qty: 1 }, { foodId: 'mixed_greens', qty: 1 }] },
  { id: 'r_yogurt_oats_bowl', name: 'Greek yogurt & oats bowl', tags: ['vegetarian', 'quick', 'high-protein'], ingredients: [{ foodId: 'greek_yogurt', qty: 1 }, { foodId: 'oats', qty: 1 }, { foodId: 'blueberries', qty: 1 }] },
  { id: 'r_dal_roti_salad', name: 'Dal, roti & salad', tags: ['vegan', 'vegetarian'], ingredients: [{ foodId: 'lentils', qty: 1.5 }, { foodId: 'roti', qty: 2 }, { foodId: 'mixed_greens', qty: 1 }] },
  { id: 'r_egg_white_omelette', name: 'Egg white omelette & toast', tags: ['vegetarian', 'high-protein', 'cutting-friendly'], ingredients: [{ foodId: 'egg_white', qty: 4 }, { foodId: 'egg', qty: 1 }, { foodId: 'whole_wheat_bread', qty: 1 }] },
  { id: 'r_protein_shake_banana', name: 'Protein shake & banana', tags: ['vegetarian', 'quick', 'high-protein'], ingredients: [{ foodId: 'whey_protein', qty: 1 }, { foodId: 'banana', qty: 1 }, { foodId: 'peanut_butter', qty: 0.5 }] },
  { id: 'r_tofu_stirfry_quinoa', name: 'Tofu stir-fry & quinoa', tags: ['vegan', 'vegetarian', 'high-protein'], ingredients: [{ foodId: 'tofu', qty: 1.5 }, { foodId: 'quinoa', qty: 1 }, { foodId: 'bell_pepper', qty: 1 }, { foodId: 'broccoli', qty: 1 }] },
  { id: 'r_salmon_sweetpotato_spinach', name: 'Salmon, sweet potato & spinach', tags: ['non-veg', 'high-protein'], ingredients: [{ foodId: 'salmon', qty: 1 }, { foodId: 'sweet_potato', qty: 1 }, { foodId: 'spinach', qty: 1 }] },
  { id: 'r_turkey_pasta', name: 'Turkey & pasta', tags: ['non-veg', 'high-protein', 'bulking-friendly'], ingredients: [{ foodId: 'turkey_breast', qty: 1.5 }, { foodId: 'pasta', qty: 1.5 }, { foodId: 'olive_oil', qty: 1 }] },
  { id: 'r_chickpea_salad', name: 'Chickpea salad', tags: ['vegan', 'vegetarian', 'quick'], ingredients: [{ foodId: 'chickpeas', qty: 1.5 }, { foodId: 'mixed_greens', qty: 1 }, { foodId: 'bell_pepper', qty: 1 }, { foodId: 'olive_oil', qty: 0.5 }] },
  { id: 'r_cottage_cheese_fruit', name: 'Cottage cheese & fruit bowl', tags: ['vegetarian', 'quick', 'cutting-friendly'], ingredients: [{ foodId: 'cottage_cheese', qty: 1.5 }, { foodId: 'apple', qty: 1 }, { foodId: 'walnuts', qty: 0.5 }] },
  { id: 'r_tempeh_buddha_bowl', name: 'Tempeh buddha bowl', tags: ['vegan', 'vegetarian', 'high-protein'], ingredients: [{ foodId: 'tempeh', qty: 1 }, { foodId: 'quinoa', qty: 1 }, { foodId: 'spinach', qty: 1 }, { foodId: 'avocado', qty: 0.5 }] },
  { id: 'r_pb_banana_toast', name: 'Peanut butter banana toast', tags: ['vegetarian', 'quick', 'bulking-friendly'], ingredients: [{ foodId: 'whole_wheat_bread', qty: 2 }, { foodId: 'peanut_butter', qty: 1 }, { foodId: 'banana', qty: 1 }] },
  { id: 'r_tuna_salad', name: 'Tuna salad', tags: ['non-veg', 'high-protein', 'cutting-friendly'], ingredients: [{ foodId: 'tuna', qty: 1 }, { foodId: 'mixed_greens', qty: 1 }, { foodId: 'bell_pepper', qty: 1 }, { foodId: 'olive_oil', qty: 0.5 }] },
  { id: 'r_shrimp_rice_bowl', name: 'Shrimp & rice bowl', tags: ['non-veg', 'high-protein'], ingredients: [{ foodId: 'shrimp', qty: 1.5 }, { foodId: 'white_rice', qty: 1 }, { foodId: 'broccoli', qty: 1 }] },
  { id: 'r_overnight_oats', name: 'Almond & chia overnight oats', tags: ['vegan', 'vegetarian', 'quick'], ingredients: [{ foodId: 'oats', qty: 1 }, { foodId: 'chia_seeds', qty: 0.5 }, { foodId: 'almonds', qty: 0.5 }, { foodId: 'soy_milk', qty: 1 }] },
  { id: 'r_black_bean_bowl', name: 'Black bean burrito bowl', tags: ['vegan', 'vegetarian'], ingredients: [{ foodId: 'black_beans', qty: 1.5 }, { foodId: 'brown_rice', qty: 1 }, { foodId: 'avocado', qty: 0.5 }, { foodId: 'bell_pepper', qty: 1 }] },
  { id: 'r_smoothie', name: 'Milk, banana & oats smoothie', tags: ['vegetarian', 'quick'], ingredients: [{ foodId: 'milk_whole', qty: 1 }, { foodId: 'banana', qty: 1 }, { foodId: 'oats', qty: 0.5 }] },
  { id: 'r_paneer_dal_combo', name: 'Paneer & dal combo', tags: ['vegetarian', 'high-protein', 'bulking-friendly'], ingredients: [{ foodId: 'paneer', qty: 1 }, { foodId: 'lentils', qty: 1 }, { foodId: 'roti', qty: 2 }] },
  { id: 'r_egg_avocado_toast', name: 'Egg & avocado toast', tags: ['vegetarian', 'quick', 'high-protein'], ingredients: [{ foodId: 'egg', qty: 2 }, { foodId: 'whole_wheat_bread', qty: 1 }, { foodId: 'avocado', qty: 0.5 }] }
];
const RECIPE_DB = RAW_RECIPES.map(r => ({ ...r, macros: computeIngredientsMacros(r.ingredients) }));

function findRecipe(id) { return RECIPE_DB.find(r => r.id === id); }

/* ---------- calculator (Mifflin-St Jeor + standard sports-nutrition ranges) ---------- */
const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', hint: 'little or no exercise', mult: 1.2 },
  { id: 'light', label: 'Light', hint: 'exercise 1-3 days/week', mult: 1.375 },
  { id: 'moderate', label: 'Moderate', hint: 'exercise 3-5 days/week', mult: 1.55 },
  { id: 'active', label: 'Active', hint: 'exercise 6-7 days/week', mult: 1.725 },
  { id: 'veryActive', label: 'Very active', hint: 'hard exercise + physical job', mult: 1.9 }
];
const NUTRITION_GOALS = [
  { id: 'cut', label: 'Lose fat', calorieAdjust: -500, proteinPerKg: 2.2 },
  { id: 'maintain', label: 'Maintain', calorieAdjust: 0, proteinPerKg: 1.8 },
  { id: 'bulk', label: 'Build muscle', calorieAdjust: 300, proteinPerKg: 2.0 }
];
function activityLevelOf(id) { return ACTIVITY_LEVELS.find(a => a.id === id) || ACTIVITY_LEVELS[0]; }
function nutritionGoalOf(id) { return NUTRITION_GOALS.find(g => g.id === id) || NUTRITION_GOALS[1]; }

function calcBMR(profile) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === 'male' ? base + 5 : base - 161;
}
function calcTDEE(profile) {
  return calcBMR(profile) * activityLevelOf(profile.activityLevel).mult;
}
function calcTargets(profile) {
  const bmr = calcBMR(profile);
  const tdee = calcTDEE(profile);
  const goal = nutritionGoalOf(profile.goal);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(tdee + goal.calorieAdjust),
    protein: Math.round(profile.weightKg * goal.proteinPerKg),
    waterLiters: Math.round(profile.weightKg * 0.033 * 10) / 10
  };
}
