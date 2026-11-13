// prisma/seed.ts
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Начинаю засев базы данных (реальные данные)...');

  // 1. Единицы измерения (оставляем как есть)
  const unitsData = [
    { code: 'm2', name: 'м²' }, { code: 'm_p', name: 'м.п.' },
    { code: 'pcs', name: 'шт' }, { code: 'm3', name: 'м³' },
    { code: 't', name: 'т' }, { code: 'hour', name: 'час' },
    { code: 'sotka', name: 'сотка' }, { code: 'usl', name: 'усл.' },
  ];
  const units = await Promise.all(
    unitsData.map(u => prisma.unit.upsert({ where: { code: u.code }, update: {}, create: u }))
  );
  const unitMap = Object.fromEntries(units.map(u => [u.code, u.id]));

  // 2. Регионы РФ (полный список субъектов)
  const regionsData = [
    { code: '01', name: 'Республика Адыгея' }, { code: '02', name: 'Республика Башкортостан' },
    { code: '03', name: 'Республика Бурятия' }, { code: '04', name: 'Республика Алтай' },
    { code: '05', name: 'Республика Дагестан' }, { code: '06', name: 'Республика Ингушетия' },
    { code: '07', name: 'Кабардино-Балкарская Республика' }, { code: '08', name: 'Республика Калмыкия' },
    { code: '09', name: 'Карачаево-Черкесская Республика' }, { code: '10', name: 'Республика Карелия' },
    { code: '11', name: 'Республика Коми' }, { code: '12', name: 'Республика Марий Эл' },
    { code: '13', name: 'Республика Мордовия' }, { code: '14', name: 'Республика Саха (Якутия)' },
    { code: '15', name: 'Республика Северная Осетия — Алания' }, { code: '16', name: 'Республика Татарстан' },
    { code: '17', name: 'Республика Тыва' }, { code: '18', name: 'Удмуртская Республика' },
    { code: '19', name: 'Республика Хакасия' }, { code: '20', name: 'Чеченская Республика' },
    { code: '21', name: 'Чувашская Республика' }, { code: '22', name: 'Алтайский край' },
    { code: '23', name: 'Краснодарский край' }, { code: '24', name: 'Красноярский край' },
    { code: '25', name: 'Приморский край' }, { code: '26', name: 'Ставропольский край' },
    { code: '27', name: 'Хабаровский край' }, { code: '28', name: 'Амурская область' },
    { code: '29', name: 'Архангельская область' }, { code: '30', name: 'Астраханская область' },
    { code: '31', name: 'Белгородская область' }, { code: '32', name: 'Брянская область' },
    { code: '33', name: 'Владимирская область' }, { code: '34', name: 'Волгоградская область' },
    { code: '35', name: 'Вологодская область' }, { code: '36', name: 'Воронежская область' },
    { code: '37', name: 'Ивановская область' }, { code: '38', name: 'Иркутская область' },
    { code: '39', name: 'Калининградская область' }, { code: '40', name: 'Калужская область' },
    { code: '41', name: 'Камчатский край' }, { code: '42', name: 'Кемеровская область' },
    { code: '43', name: 'Кировская область' }, { code: '44', name: 'Костромская область' },
    { code: '45', name: 'Курганская область' }, { code: '46', name: 'Курская область' },
    { code: '47', name: 'Ленинградская область' }, { code: '48', name: 'Липецкая область' },
    { code: '49', name: 'Магаданская область' }, { code: '50', name: 'Московская область' },
    { code: '51', name: 'Мурманская область' }, { code: '52', name: 'Нижегородская область' },
    { code: '53', name: 'Новгородская область' }, { code: '54', name: 'Новосибирская область' },
    { code: '55', name: 'Омская область' }, { code: '56', name: 'Оренбургская область' },
    { code: '57', name: 'Орловская область' }, { code: '58', name: 'Пензенская область' },
    { code: '59', name: 'Пермский край' }, { code: '60', name: 'Псковская область' },
    { code: '61', name: 'Ростовская область' }, { code: '62', name: 'Рязанская область' },
    { code: '63', name: 'Самарская область' }, { code: '64', name: 'Саратовская область' },
    { code: '65', name: 'Сахалинская область' }, { code: '66', name: 'Свердловская область' },
    { code: '67', name: 'Смоленская область' }, { code: '68', name: 'Тамбовская область' },
    { code: '69', name: 'Тверская область' }, { code: '70', name: 'Томская область' },
    { code: '71', name: 'Тульская область' }, { code: '72', name: 'Тюменская область' },
    { code: '73', name: 'Ульяновская область' }, { code: '74', name: 'Челябинская область' },
    { code: '75', name: 'Забайкальский край' }, { code: '76', name: 'Ярославская область' },
    { code: '77', name: 'Москва' }, { code: '78', name: 'Санкт-Петербург' },
    { code: '79', name: 'Еврейская автономная область' }, { code: '80', name: 'Донецкая Народная Республика' },
    { code: '81', name: 'Луганская Народная Республика' }, { code: '82', name: 'Республика Крым' },
    { code: '83', name: 'Ненецкий автономный округ' }, { code: '84', name: 'Запорожская область' },
    { code: '85', name: 'Херсонская область' }, { code: '86', name: 'Ханты-Мансийский автономный округ — Югра' },
    { code: '87', name: 'Чукотский автономный округ' }, { code: '88', name: 'Ямало-Ненецкий автономный округ' },
    { code: '89', name: 'Севастополь' },
  ];
  const regions = await Promise.all(
    regionsData.map(r => prisma.region.upsert({ where: { code: r.code }, update: {}, create: r }))
  );
  const regionMap = Object.fromEntries(regions.map(r => [r.code, r.id]));

  // 3. Категории (расширенные)
  const categoriesData = [
    { slug: 'repair', name: 'Ремонт и отделка' },
    { slug: 'electric', name: 'Электрика' },
    { slug: 'plumbing', name: 'Сантехника' },
    { slug: 'construction', name: 'Строительные работы' },
    { slug: 'furniture', name: 'Мебель' },
    { slug: 'cleaning', name: 'Клининговые услуги' },
    { slug: 'freight', name: 'Грузовые услуги' },
    { slug: 'landscaping', name: 'Благоустройство' },
    { slug: 'auto', name: 'Автомобильные услуги' },
    { slug: 'other', name: 'Прочие услуги' },
  ];
  const categories = await Promise.all(
    categoriesData.map(c => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  // 4. Услуги (реалистичный набор для каждой категории)
  const servicesData = [
    // Ремонт и отделка
    { code: 'wall_paint', name: 'Покраска стен', categoryId: catMap.repair, defaultUnitId: unitMap.m2 },
    { code: 'wallpaper_install', name: 'Поклейка обоев', categoryId: catMap.repair, defaultUnitId: unitMap.m2 },
    { code: 'tile_install', name: 'Укладка плитки', categoryId: catMap.repair, defaultUnitId: unitMap.m2 },
    { code: 'putty_walls', name: 'Шпаклевка стен', categoryId: catMap.repair, defaultUnitId: unitMap.m2 },
    { code: 'plaster_walls', name: 'Штукатурка стен', categoryId: catMap.repair, defaultUnitId: unitMap.m2 },
    // Электрика
    { code: 'socket_install', name: 'Установка розетки', categoryId: catMap.electric, defaultUnitId: unitMap.pcs },
    { code: 'switch_install', name: 'Установка выключателя', categoryId: catMap.electric, defaultUnitId: unitMap.pcs },
    { code: 'wiring_install', name: 'Прокладка кабеля', categoryId: catMap.electric, defaultUnitId: unitMap.m_p },
    { code: 'panel_mount', name: 'Монтаж электрощита', categoryId: catMap.electric, defaultUnitId: unitMap.pcs },
    // Сантехника
    { code: 'pipe_install', name: 'Монтаж труб', categoryId: catMap.plumbing, defaultUnitId: unitMap.m_p },
    { code: 'toilet_install', name: 'Установка унитаза', categoryId: catMap.plumbing, defaultUnitId: unitMap.pcs },
    { code: 'sink_install', name: 'Установка раковины', categoryId: catMap.plumbing, defaultUnitId: unitMap.pcs },
    { code: 'bath_install', name: 'Установка ванны', categoryId: catMap.plumbing, defaultUnitId: unitMap.pcs },
    // Строительные работы
    { code: 'brick_masonry', name: 'Кладка кирпича', categoryId: catMap.construction, defaultUnitId: unitMap.m3 },
    { code: 'concrete_pour', name: 'Заливка бетона', categoryId: catMap.construction, defaultUnitId: unitMap.m3 },
    { code: 'roof_install', name: 'Монтаж кровли', categoryId: catMap.construction, defaultUnitId: unitMap.m2 },
    { code: 'floor_screed', name: 'Стяжка пола', categoryId: catMap.construction, defaultUnitId: unitMap.m2 },
    // Мебель
    { code: 'furniture_assembly', name: 'Сборка корпусной мебели', categoryId: catMap.furniture, defaultUnitId: unitMap.usl },
    { code: 'furniture_install', name: 'Установка мебели', categoryId: catMap.furniture, defaultUnitId: unitMap.pcs },
    // Клининг
    { code: 'cleaning_maintenance', name: 'Поддерживающая уборка', categoryId: catMap.cleaning, defaultUnitId: unitMap.m2 },
    { code: 'cleaning_general', name: 'Генеральная уборка', categoryId: catMap.cleaning, defaultUnitId: unitMap.m2 },
    { code: 'cleaning_after_repair', name: 'Уборка после ремонта', categoryId: catMap.cleaning, defaultUnitId: unitMap.m2 },
    // Грузовые услуги
    { code: 'loading_works', name: 'Погрузочно-разгрузочные работы', categoryId: catMap.freight, defaultUnitId: unitMap.t },
    { code: 'moving_services', name: 'Квартирный переезд', categoryId: catMap.freight, defaultUnitId: unitMap.hour },
    // Благоустройство
    { code: 'lawn_mowing', name: 'Покос травы', categoryId: catMap.landscaping, defaultUnitId: unitMap.sotka },
    { code: 'area_cleaning', name: 'Уборка территории', categoryId: catMap.landscaping, defaultUnitId: unitMap.sotka },
    // Автоуслуги (базовые)
    { code: 'auto_repair', name: 'Ремонт автомобиля', categoryId: catMap.auto, defaultUnitId: unitMap.hour },
    { code: 'auto_maintenance', name: 'Техническое обслуживание', categoryId: catMap.auto, defaultUnitId: unitMap.hour },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: { name: s.name, categoryId: s.categoryId, defaultUnitId: s.defaultUnitId },
      create: s,
    });
  }
  const services = await prisma.service.findMany();
  const serviceMap = Object.fromEntries(services.map(s => [s.code, s.id]));

  // 5. Системный пользователь (владелец системных прайсов)
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@ai-smeta.local' },
    update: {},
    create: { email: 'system@ai-smeta.local', status: 'active' },
  });

  // 6. Системный прайс-лист (Москва) с реальными ценами
  const systemPriceListMoscow = await prisma.priceList.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      ownerId: systemUser.id,
      name: 'Системный справочник (Москва)',
      type: 'system',
      regionId: regionMap['77'], // Код Москвы
      isDefault: true,
    },
  });

  // 7. Системный прайс-лист (Краснодар) — с чуть меньшими ценами
  const systemPriceListKrasnodar = await prisma.priceList.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      ownerId: systemUser.id,
      name: 'Системный справочник (Краснодар)',
      type: 'system',
      regionId: regionMap['23'], // Код Краснодарского края
      isDefault: true,
    },
  });

  // 8. Добавляем РЕАЛЬНЫЕ цены в прайсы (ориентировочные рыночные)
  const pricesMoscow = [
    // Отделка
    { service: 'wall_paint', price: 400.00, unit: 'm2' },
    { service: 'putty_walls', price: 600.00, unit: 'm2' },
    { service: 'plaster_walls', price: 900.00, unit: 'm2' },
    { service: 'tile_install', price: 1500.00, unit: 'm2' },
    // Электрика
    { service: 'socket_install', price: 500.00, unit: 'pcs' },
    { service: 'switch_install', price: 500.00, unit: 'pcs' },
    { service: 'wiring_install', price: 100.00, unit: 'm_p' },
    // Сантехника
    { service: 'pipe_install', price: 650.00, unit: 'm_p' },
    { service: 'toilet_install', price: 2000.00, unit: 'pcs' },
    { service: 'sink_install', price: 1200.00, unit: 'pcs' },
    // Мебель
    { service: 'furniture_assembly', price: 2500.00, unit: 'usl' },
    // Клининг
    { service: 'cleaning_maintenance', price: 120.00, unit: 'm2' },
    { service: 'cleaning_general', price: 200.00, unit: 'm2' },
  ];
  const pricesKrasnodar = [
    // Чуть ниже московских
    { service: 'wall_paint', price: 350.00, unit: 'm2' },
    { service: 'putty_walls', price: 500.00, unit: 'm2' },
    { service: 'tile_install', price: 1200.00, unit: 'm2' },
    { service: 'socket_install', price: 400.00, unit: 'pcs' },
    { service: 'toilet_install', price: 1800.00, unit: 'pcs' },
    { service: 'cleaning_general', price: 150.00, unit: 'm2' },
  ];

  // Функция для безопасного создания цен (чтобы не дублировать при повторном запуске)
  const seedPrices = async (priceListId: string, prices: any[]) => {
    for (const p of prices) {
      await prisma.priceListItem.create({
        data: {
          priceListId,
          serviceId: serviceMap[p.service],
          unitId: unitMap[p.unit],
          price: p.price,
          validFrom: new Date('2025-01-01'),
        }
      }).catch(() => {}); // Игнорируем ошибку уникальности, если такая цена уже есть
    }
  };

  await seedPrices(systemPriceListMoscow.id, pricesMoscow);
  await seedPrices(systemPriceListKrasnodar.id, pricesKrasnodar);

  // 9. Тестовый мастер (для проверки Auth и создания смет)
  const testUser = await prisma.user.upsert({
    where: { email: 'master@test.local' },
    update: {},
    create: { email: 'master@test.local', status: 'active' },
  });

  await prisma.messengerAccount.upsert({
    where: { provider_externalUserId: { provider: 'telegram', externalUserId: '123456789' } },
    update: {},
    create: {
      userId: testUser.id,
      provider: 'telegram',
      externalUserId: '123456789',
      username: 'test_master',
    },
  });

  console.log('✅ Засев успешно завершен! Регионы, категории и реальные цены добавлены.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
