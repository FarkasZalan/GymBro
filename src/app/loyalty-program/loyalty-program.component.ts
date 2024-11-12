import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-loyalty-program',
  templateUrl: './loyalty-program.component.html',
  styleUrl: './loyalty-program.component.scss'
})
export class LoyaltyProgramComponent {

  constructor(private location: Location) { }

  rewards = [
    { title: '5% Discount', description: 'Get 5% off your next purchase', points: 100, image: '/assets/images/discount.jpg' },
    { title: 'Free Protein Bar', description: 'Redeem for a free protein bar', points: 200, image: '/assets/images/protein-bar.jpg' },
    { title: '10% Discount', description: 'Get 10% off your next purchase', points: 500, image: '/assets/images/discount10.jpg' }
  ];

  tiers = [
    { name: 'Bronze', description: 'Join and start earning points', requiredPoints: 0 },
    { name: 'Silver', description: 'Unlock more rewards at 500 points', requiredPoints: 500 },
    { name: 'Gold', description: 'Exclusive rewards at 1000 points', requiredPoints: 1000 }
  ];

  faqs = [
    { question: 'How do I earn points?', answer: 'You earn 1 point for every 100 Ft spent in our store.' },
    { question: 'Do points expire?', answer: 'Points expire after 12 months of inactivity.' },
    { question: 'How do I redeem my points?', answer: 'Select an available reward and redeem it during checkout.' }
  ];

  back() {
    this.location.back();
  }
}
