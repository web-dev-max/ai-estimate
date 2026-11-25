// prisma/seed.ts
import { PrismaClient } from '../apps/backend/src/database/generated/prisma/client';
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

  // 6. ЕДИНАЯ книга расценок. Три прайса выводятся из неё — покрытие всегда полное.
  // Все значения ориентировочные, isVerified = false. Не официальная статистика.
  const priceBook: Array<{
    service: string;
    unit: string;
    moscow: number;
    krasnodar: number;
  }> = [
    // Ремонт и отделка
    { service: 'wall_paint',            unit: 'm2',    moscow: 400,  krasnodar: 350 },
    { service: 'wallpaper_install',     unit: 'm2',    moscow: 350,  krasnodar: 300 },
    { service: 'tile_install',          unit: 'm2',    moscow: 1500, krasnodar: 1200 },
    { service: 'putty_walls',           unit: 'm2',    moscow: 600,  krasnodar: 500 },
    { service: 'plaster_walls',         unit: 'm2',    moscow: 900,  krasnodar: 750 },
    // Электрика
    { service: 'socket_install',        unit: 'pcs',   moscow: 500,  krasnodar: 400 },
    { service: 'switch_install',        unit: 'pcs',   moscow: 500,  krasnodar: 400 },
    { service: 'wiring_install',        unit: 'm_p',   moscow: 100,  krasnodar: 80 },
    { service: 'panel_mount',           unit: 'pcs',   moscow: 3500, krasnodar: 3000 },
    // Сантехника
    { service: 'pipe_install',          unit: 'm_p',   moscow: 650,  krasnodar: 550 },
    { service: 'toilet_install',        unit: 'pcs',   moscow: 2000, krasnodar: 1800 },
    { service: 'sink_install',          unit: 'pcs',   moscow: 1200, krasnodar: 1000 },
    { service: 'bath_install',          unit: 'pcs',   moscow: 3500, krasnodar: 3000 },
    // Строительные работы
    { service: 'brick_masonry',         unit: 'm3',    moscow: 6000, krasnodar: 5000 },
    { service: 'concrete_pour',         unit: 'm3',    moscow: 4500, krasnodar: 4000 },
    { service: 'roof_install',          unit: 'm2',    moscow: 1200, krasnodar: 1000 },
    { service: 'floor_screed',          unit: 'm2',    moscow: 700,  krasnodar: 600 },
    // Мебель
    { service: 'furniture_assembly',    unit: 'usl',   moscow: 2500, krasnodar: 2000 },
    { service: 'furniture_install',     unit: 'pcs',   moscow: 1500, krasnodar: 1200 },
    // Клининг
    { service: 'cleaning_maintenance',  unit: 'm2',    moscow: 120,  krasnodar: 100 },
    { service: 'cleaning_general',      unit: 'm2',    moscow: 200,  krasnodar: 150 },
    { service: 'cleaning_after_repair', unit: 'm2',    moscow: 250,  krasnodar: 200 },
    // Грузовые услуги
    { service: 'loading_works',         unit: 't',     moscow: 3000, krasnodar: 2500 },
    { service: 'moving_services',       unit: 'hour',  moscow: 1500, krasnodar: 1200 },
    // Благоустройство
    { service: 'lawn_mowing',           unit: 'sotka', moscow: 1500, krasnodar: 1200 },
    { service: 'area_cleaning',         unit: 'sotka', moscow: 2000, krasnodar: 1700 },
    // Автоуслуги
    { service: 'auto_repair',           unit: 'hour',  moscow: 2000, krasnodar: 1600 },
    { service: 'auto_maintenance',      unit: 'hour',  moscow: 1500, krasnodar: 1200 },
  ];

  // Проверка полноты: книга обязана покрывать все услуги каталога
  const missing = Object.keys(serviceMap).filter(
    (code) => !priceBook.some((p) => p.service === code),
  );
  if (missing.length) {
    throw new Error(`Сид: в книге расценок нет услуг: ${missing.join(', ')}`);
  }

  const roundTo5 = (v: number) => Math.round(v / 5) * 5;
  const pick = (key: 'moscow' | 'krasnodar') =>
    priceBook.map((p) => ({ service: p.service, unit: p.unit, price: p[key] }));
  const nationalPrices = priceBook.map((p) => ({
    service: p.service,
    unit: p.unit,
    price: roundTo5((p.moscow + p.krasnodar) / 2),
  }));

  // 7. Идемпотентная запись расценок
  const seedPrices = async (
    priceListId: string,
    prices: Array<{ service: string; price: number; unit: string }>,
    isVerified = false,
  ) => {
    const validFrom = new Date('2025-01-01');
    for (const p of prices) {
      const serviceId = serviceMap[p.service];
      const unitId = unitMap[p.unit];
      if (!serviceId || !unitId) {
        throw new Error(`Сид: неизвестная услуга "${p.service}" или единица "${p.unit}"`);
      }
      await prisma.priceListItem.upsert({
        where: {
          priceListId_serviceId_unitId_validFrom: { priceListId, serviceId, unitId, validFrom },
        },
        update: { price: p.price, isVerified },
        create: { priceListId, serviceId, unitId, price: p.price, validFrom, isVerified },
      });
    }
  };

  // 8. Три системных прайса: Москва, Краснодар, общероссийский (fallback для всех 89 регионов)
  const systemLists: Array<{
    id: string;
    name: string;
    regionCode: string | null;
    prices: Array<{ service: string; unit: string; price: number }>;
  }> = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Системный справочник (Москва)',
      regionCode: '77',
      prices: pick('moscow'),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Системный справочник (Краснодарский край)',
      regionCode: '23',
      prices: pick('krasnodar'),
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Системный справочник (общероссийский, ориентировочный)',
      regionCode: null,
      prices: nationalPrices,
    },
  ];

  for (const list of systemLists) {
    const regionId = list.regionCode ? regionMap[list.regionCode] : null;
    if (list.regionCode && !regionId) {
      throw new Error(`Сид: неизвестный регион "${list.regionCode}"`);
    }
    const priceList = await prisma.priceList.upsert({
      where: { id: list.id },
      update: { name: list.name, regionId },
      create: {
        id: list.id,
        ownerId: systemUser.id,
        name: list.name,
        type: 'system',
        regionId,
        isDefault: true,
      },
    });
    await seedPrices(priceList.id, list.prices, false);
  }

  // 9. Алиасы услуг для Catalog Matcher (этап 3)
  const aliases: Record<string, string[]> = {
    tile_install: ['укладка кафеля', 'плитка на пол', 'плитка на стены', 'облицовка плиткой', 'кафель', 'плитка'],
    wall_paint: ['покрасить стены', 'окраска стен', 'краска стен', 'покраска'],
    putty_walls: ['шпаклёвка', 'шпаклевка', 'зашпаклевать стены', 'шпатлёвка'],
    plaster_walls: ['оштукатурить', 'штукатурка', 'штукатурить стены'],
    floor_screed: ['стяжка', 'стяжка пола', 'залить стяжку', 'выравнивание пола'],
    wallpaper_install: ['обои', 'поклеить обои', 'оклейка обоями', 'поклейка обоев'],
    socket_install: ['розетки', 'поставить розетку', 'монтаж розеток', 'розетка'],
    switch_install: ['выключатель', 'выключатели', 'поставить выключатель'],
    wiring_install: ['проводка', 'кабель', 'штробление под кабель', 'проложить кабель'],
    panel_mount: ['электрощит', 'щиток', 'собрать щиток', 'монтаж щита'],
    pipe_install: ['трубы', 'разводка труб', 'проложить трубы', 'водопровод'],
    toilet_install: ['унитаз', 'поставить унитаз', 'монтаж унитаза'],
    sink_install: ['раковина', 'умывальник', 'мойка на кухню', 'поставить раковину'],
    bath_install: ['ванна', 'поставить ванну', 'монтаж ванны', 'ванну'],
    brick_masonry: ['кладка кирпича', 'кирпичная кладка', 'выложить кирпичом'],
    concrete_pour: ['бетон', 'залить бетон', 'бетонирование', 'заливка бетона'],
    roof_install: ['кровля', 'крыша', 'монтаж кровли', 'перекрыть крышу'],
    furniture_assembly: ['сборка мебели', 'собрать шкаф', 'сборка шкафа', 'собрать кухню'],
    furniture_install: ['установить мебель', 'повесить шкаф', 'монтаж мебели'],
    cleaning_maintenance: ['поддерживающая уборка', 'регулярная уборка'],
    cleaning_general: ['генеральная уборка', 'генуборка'],
    cleaning_after_repair: ['уборка после ремонта', 'клининг после ремонта', 'убрать после ремонта'],
    loading_works: ['погрузка', 'разгрузка', 'грузчики', 'погрузочные работы'],
    moving_services: ['переезд', 'квартирный переезд', 'перевезти вещи'],
    lawn_mowing: ['покос', 'покос травы', 'скосить траву', 'трава'],
    area_cleaning: ['уборка территории', 'убрать участок', 'уборка участка'],
    auto_repair: ['ремонт автомобиля', 'ремонт машины', 'авторемонт'],
    auto_maintenance: ['то автомобиля', 'техобслуживание', 'замена масла'],
  };

  for (const [code, list] of Object.entries(aliases)) {
    const serviceId = serviceMap[code];
    if (!serviceId) throw new Error(`Сид: алиас для неизвестной услуги "${code}"`);
    for (const alias of list) {
      await prisma.serviceAlias.upsert({
        where: { alias },
        update: { serviceId },
        create: { alias, serviceId },
      });
    }
  }

  // 10. Тестовый мастер + пустой личный прайс (мастер заполняет сам и перекрывает системные цены)
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

  await prisma.priceList.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      ownerId: testUser.id,
      name: 'Мой прайс',
      type: 'personal',
      regionId: null,
      isDefault: true,
    },
  });

  const counts = await prisma.priceListItem.groupBy({
    by: ['priceListId'],
    _count: { _all: true },
  });
  console.log(`✅ Сид завершён. Услуг: ${Object.keys(serviceMap).length}, расценок: ${counts.reduce((s, c) => s + c._count._all, 0)}, алиасов: ${Object.values(aliases).flat().length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
