import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleClothesComponent } from './handle-clothes.component';

describe('HandleClothesComponent', () => {
  let component: HandleClothesComponent;
  let fixture: ComponentFixture<HandleClothesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HandleClothesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandleClothesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
