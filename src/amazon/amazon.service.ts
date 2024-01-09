import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-core';

@Injectable()
export class AmazonService {
  constructor(private readonly configService: ConfigService) {}

  async getProducts(product: string) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.configService.getOrThrow('SBR_WS_ENDPOINT'),
    });

    try {
      const page = await browser.newPage();

      const TIME_OUT_NAVIGATION = 2 * 60 * 1000;
      page.setDefaultNavigationTimeout(TIME_OUT_NAVIGATION);

      await Promise.all([
        page.waitForNavigation(),
        page.goto(`https://www.amazon.com`),
      ]);

      await page.type('#twotabsearchtextbox', product);

      await Promise.all([
        page.waitForNavigation(),
        page.click('#nav-search-submit-button'),
      ]);

      return await page.$$eval(
        '.s-search-results .s-card-container',
        (resultItems) => {
          return resultItems.map((productCard) => {
            const resultProduct = {
              url: productCard.querySelector('a').href,
              title: productCard.querySelector(
                '.s-title-instructions-style span',
              )?.textContent,
              price: productCard.querySelector('.a-price .a-offscreen')
                .textContent,
            };

            return resultProduct;
          });
        },
      );
    } catch (error) {
      console.log(error);
    } finally {
      await browser.close();
    }
  }
}
