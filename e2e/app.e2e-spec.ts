import { DasboardPage } from './app.po';

describe('dasboard App', () => {
  let page: DasboardPage;

  beforeEach(() => {
    page = new DasboardPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
