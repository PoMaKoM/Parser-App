const axios = require('axios');
const config = require('config');
const log4js = require('log4js');

log4js.configure({
  appenders: { file: { type: 'file', filename: 'logs/info.log' } },
  categories: { default: { appenders: ['file'], level: 'all' } }
});

const logger = log4js.getLogger('info');

logger.warn('=========================================');
logger.warn('НАЧАЛО НОВОГО ФАЙЛА!');
logger.warn('=========================================');
logger.info('');

async function getInfo() {
  try {
    const perPage = '100';

    logger.debug(
      `Отладочная информация: perPage=${perPage}, sortBy=${config.get(
        'sortBy'
      )}, adres=${config.get('adres')}`
    );
    logger.info('');

    let pageCount = false;
    let totalCount = false;

    // Получаем мету
    const responseForMeta = await axios.get(config.get('adres'), {
      params: {
        page: '1',
        sort: config.get('sortBy'),
        'per-page': perPage
      }
    });

    // Валидируем и сохраняем
    if (Number(perPage) !== Number(responseForMeta.data._meta.perPage)) {
      throw Error('ConfigError. PerPage должен быть не больше 100');
    }

    pageCount = responseForMeta.data._meta.pageCount;
    totalCount = responseForMeta.data._meta.totalCount;
    console.log(`Скрипт начал работу`);

    // Получение стра
    for (let i = 0; i < pageCount; i++) {
      logger.info('=========================================');
      logger.info(`Начало страницы. Номер страницы: ${i + 1}`);
      logger.info(`=========================================`);

      const responsePage = await axios.get(config.get('adres'), {
        params: {
          page: i + 1,
          sort: config.get('sortBy'),
          'per-page': perPage
        }
      });

      responsePage.data.items.forEach(item => {
        if (item) {
          let good = false;
          item.certdecltr_ConformityDocDetails.TechnicalRegulationObjectDetails.ManufacturerDetails.forEach(
            element => {
              if (element.UnifiedCountryCode) {
                country = element.UnifiedCountryCode;
                if (country === 'CN') {
                  good = true;
                }
              }
            }
          );
          if (good) {
            if (
              item.certdecltr_ConformityDocDetails.ApplicantDetails
                .BusinessEntityBriefName
            ) {
              logger.info(
                item.certdecltr_ConformityDocDetails.ApplicantDetails
                  .BusinessEntityBriefName
              );
            } else {
              logger.info(
                item.certdecltr_ConformityDocDetails.ApplicantDetails
                  .BusinessEntityName
              );
            }
          }
        }
      });
      logger.info(`=========================================`);
      logger.info(`Конец страницы. Номер страницы: ${i + 1}`);
      console.log(`Cтраница: ${i + 1} из ${pageCount}`);
    }

    logger.info('КОНЕЦ ФАЙЛА!');
    logger.debug(`Всего файлов проверено: ${totalCount}`);
    console.log(`Работа скрипта завершена! Поздравляю =)`);
    console.log(`Всего файлов проверено: ${totalCount}`);
  } catch (error) {
    logger.warn(`ОШИБКА: ${error}`);
    console.error(`ОШИБКА: ${error}`);
  }
}

getInfo();
