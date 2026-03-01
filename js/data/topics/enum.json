{
  "tag": "enum",
  "name": "Перечисления (Enum)",
  "difficultyLevels": [
    {
      "level": 1,
      "tasks": [
        { "id": 16101, "title": "Времена года", "description": "Создай enum Season (Winter, Spring, Summer, Autumn) и выведи Summer в консоль.", "requirements": ["Объявление enum"], "hint": "Пиши enum вне метода Main.", "exampleConsoleOutput": "Summer" },
        { "id": 16102, "title": "Числовое значение", "description": "Выведи порядковый номер (int) для значения Autumn из enum Season.", "requirements": ["Приведение типов (int)"], "hint": "(int)Season.Autumn", "exampleConsoleOutput": "3" },
        { "id": 16103, "title": "Свои индексы", "description": "Создай enum HttpCode, где OK = 200, BadRequest = 400, NotFound = 404.", "requirements": ["Явное присвоение чисел"], "hint": "Пиши Name = Value внутри enum.", "exampleConsoleOutput": "Код: 404" },
        { "id": 16104, "title": "Цвета светофора", "description": "Переменная Light хранит цвет. Если Red — стой, Green — иди.", "requirements": ["if-else или switch", "Enum"], "hint": "Сравнивай Light == TrafficLight.Red.", "exampleConsoleOutput": "Стой!" },
        { "id": 16105, "title": "Дни недели", "description": "Создай enum и проверь, является ли выбранный день выходным (Saturday/Sunday).", "requirements": ["Логическое ИЛИ (||)"], "hint": "if (day == Day.Sat || day == Day.Sun)", "exampleConsoleOutput": "Выходной: True" },
        { "id": 16106, "title": "Тип топлива", "description": "Класс Car с полем FuelType (Enum: Petrol, Diesel, Electric).", "requirements": ["Enum как поле класса"], "hint": "В классе напиши: public FuelType Fuel { get; set; }", "exampleConsoleOutput": "Тип: Electric" },
        { "id": 16107, "title": "Уровни сложности", "description": "Выведи все значения enum Difficulty через цикл.", "requirements": ["Enum.GetValues"], "hint": "foreach (var v in Enum.GetValues(typeof(Difficulty)))", "exampleConsoleOutput": "Easy, Medium, Hard" },
        { "id": 16108, "title": "Приоритет задачи", "description": "Enum Priority (Low, Medium, High). Метод, принимающий Priority и меняющий цвет консоли.", "requirements": ["Console.ForegroundColor"], "hint": "Для High ставь Red, для Low — Gray.", "exampleConsoleOutput": "ВАЖНО (красным цветом)" },
        { "id": 16109, "title": "Пол человека", "description": "Enum Gender. При вводе '0' создавай Male, '1' — Female.", "requirements": ["Каст (Gender)int.Parse(...)"], "hint": "Число можно напрямую превратить в Enum.", "exampleConsoleOutput": "Выбран: Female" },
        { "id": 16110, "title": "Размер одежды", "description": "Enum Size (S, M, L, XL). Выведи размер, который идет после M.", "requirements": ["Арифметика с enum"], "hint": "(Size)((int)current + 1)", "exampleConsoleOutput": "Следующий: L" }
      ]
    },
    {
      "level": 2,
      "tasks": [
        { "id": 16201, "title": "Меню банкомата", "description": "Enum Actions (CheckBalance, Withdraw, Deposit). Пользователь вводит цифру — срабатывает нужный метод класса Bank.", "requirements": ["Switch по Enum", "Классы"], "hint": "Преврати ввод юзера в Enum и закинь в switch.", "exampleConsoleOutput": "Вы выбрали: Снятие" },
        { "id": 16202, "title": "Фильтр товаров по категории", "description": "List<Product>, где у каждого есть Category (Enum). Вывести только товары категории 'Electronics'.", "requirements": ["LINQ или foreach", "Enum"], "hint": "p.Category == Category.Electronics", "exampleConsoleOutput": "iPhone, Radio" },
        { "id": 16203, "title": "Парсинг из грязной строки", "description": "Пользователь вводит 'admin' или 'ADMIN'. Программа должна распарсить это в UserRole.Admin без учета регистра.", "requirements": ["Enum.TryParse", "ignoreCase: true"], "hint": "Используй перегрузку TryParse с тремя аргументами.", "exampleConsoleOutput": "Роль установлена: Admin" },
        { "id": 16204, "title": "Логирование уровней", "description": "Класс Logger. Метод Log(string msg, LogLevel level). Если уровень Error — писать в файл, если Info — только в консоль.", "requirements": ["Enum", "System.IO"], "hint": "LogLevel: Info, Warning, Error.", "exampleConsoleOutput": "[Error] записан в файл log.txt" },
        { "id": 16205, "title": "Битва монстров", "description": "Enum DamageType (Fire, Water, Earth). Если монстр Fire атакует монстра Water — урон уменьшается вдвое.", "requirements": ["Логика взаимодействий", "Enum"], "hint": "Проверяй типы атакующего и цели.", "exampleConsoleOutput": "Урон снижен! Эффект: Неэффективно" },
        { "id": 16206, "title": "Словарь статусов", "description": "Dictionary<OrderStatus, string> — описание каждого статуса. Выведи описание для статуса, введенного пользователем.", "requirements": ["Dictionary", "Enum как ключ"], "hint": "dict[status]", "exampleConsoleOutput": "Shipped: 'Товар передан курьеру'" },
        { "id": 16207, "title": "Расчет зарплаты", "description": "Enum Position (Intern, Junior, Middle, Senior). Зарплата = 500 * (int)Position. У Senior индекс должен быть 4.", "requirements": ["Математика с Enum"], "hint": "Задай Senior = 4 в объявлении.", "exampleConsoleOutput": "Зарплата Senior: 2000" },
        { "id": 16208, "title": "Валидация Regex + Enum", "description": "Распарси строку 'ROLE_MODERATOR' в Enum, предварительно удалив 'ROLE_' через Regex.", "requirements": ["Regex.Replace", "Enum.Parse"], "hint": "Сначала очисти строку, потом парси.", "exampleConsoleOutput": "Успешно: Moderator" },
        { "id": 16209, "title": "Дни недели на разных языках", "description": "Метод возвращает название дня недели (Enum) на русском языке.", "requirements": ["Switch-expression (C# 8.0+)"], "hint": "day switch { Day.Mon => \"Пн\", ... }", "exampleConsoleOutput": "Monday -> Понедельник" },
        { "id": 16210, "title": "Система прав доступа (Flags)", "description": "Используй атрибут [Flags] для Enum Permissions. Дай юзеру права Read и Write одновременно.", "requirements": ["Атрибут [Flags]", "Битовое ИЛИ |"], "hint": "Permissions.Read | Permissions.Write.", "exampleConsoleOutput": "Права: Read, Write" },
        { "id": 16211, "title": "Сортировка по Enum", "description": "Отсортируй список задач List<Task> по их приоритету (High должен быть первым).", "requirements": ["OrderByDescending"], "hint": "OrderBy сортирует по числовому значению Enum.", "exampleConsoleOutput": "1. Срочно (High), 2. Потом (Low)" },
        { "id": 16212, "title": "Конвертер валют", "description": "Enum Currency (USD, EUR, RUB). Метод Convert(double amt, Currency from, Currency to).", "requirements": ["Сложная логика пересчета"], "hint": "Используй промежуточный перевод в базовую валюту (например, в RUB).", "exampleConsoleOutput": "100 USD = 9200 RUB" },
        { "id": 16213, "title": "Состояние документа", "description": "Класс Document с Enum State. Метод NextState() переводит Draft -> Review -> Published.", "requirements": ["Логика переходов"], "hint": "В switch проверяй текущее состояние и ставь новое.", "exampleConsoleOutput": "Документ отправлен на проверку" },
        { "id": 16214, "title": "Поиск в массиве по Enum", "description": "Массив объектов User. Найти первого юзера с Role.Admin.", "requirements": ["Цикл", "Сравнение объектов"], "hint": "if (u.Role == Role.Admin)", "exampleConsoleOutput": "Найден: admin_vasya" },
        { "id": 16215, "title": "Статистика погоды", "description": "List<WeatherType>. Посчитать, сколько раз в неделю было 'Sunny'.", "requirements": ["Dictionary для подсчета"], "hint": "Ключ — Enum, значение — int.", "exampleConsoleOutput": "Солнечных дней: 4" },
        { "id": 16216, "title": "Генератор аватарок", "description": "Enum BodyPart { Head, Torso, Legs }. Метод генерирует строку-картинку в зависимости от Enum.", "requirements": ["Рисование символами"], "hint": "Head => \"(o_o)\", Torso => \"/|\\\"", "exampleConsoleOutput": " (o_o) \n /|\\ " },
        { "id": 16217, "title": "Парсинг CSV с Enum", "description": "Строка 'Meat;100;Food'. Распарси 'Food' в Enum Category объекта Product.", "requirements": ["Split", "Enum.Parse"], "hint": "Category = (Category)Enum.Parse(typeof(Category), parts[2])", "exampleConsoleOutput": "Продукт: Meat, Тип: Food" },
        { "id": 16218, "title": "Игра: Камень-Ножницы-Бумага", "description": "Enum Move { Rock, Paper, Scissors }. Реализуй логику победы игрока над ботом.", "requirements": ["Random", "Сравнение Enum"], "hint": "Генерируй случайное число 0-2 и кастуй в Move.", "exampleConsoleOutput": "Бот: Rock. Вы: Paper. Победа!" },
        { "id": 16219, "title": "Месяцы и дни", "description": "По Enum Month определи, сколько в нем дней (без учета високосного года).", "requirements": ["Switch с несколькими case"], "hint": "case Month.Apr: case Month.Jun: ... => 30.", "exampleConsoleOutput": "В Июне 30 дней" },
        { "id": 16220, "title": "Безопасное удаление", "description": "Метод DeleteUser(User u). Если u.Role == Role.SuperAdmin — запретить удаление.", "requirements": ["Защитная логика"], "hint": "Используй return или исключение.", "exampleConsoleOutput": "Ошибка: Нельзя удалить создателя" }
      ]
    }
  ]
}
