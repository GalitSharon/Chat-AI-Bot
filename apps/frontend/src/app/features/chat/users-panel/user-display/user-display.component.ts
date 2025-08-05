import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';
import { icons } from '../../../../shared/icons';
import { colorPalettes } from '../../../../shared/colorPalettes';

@Component({
  selector: 'app-user-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDisplayComponent {
  @Input() user!: User;
  @Input() isOnline = false;
  @Input() showStatus = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get avatarSize(): number {
    switch (this.size) {
      case 'small':
        return 32;
      case 'large':
        return 56;
      default:
        return 40;
    }
  }

  getUserAvatarStyle(): { [key: string]: string } {
    const colors = this.generateUserColors(this.user?.name || 'anonymous');
    return {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    };
  }

  getUserIcon(): string {
    const userName = this.user?.name || 'anonymous';
    const index = this.hashString(userName) % icons.length;
    return icons[index];
  }

  private generateUserColors(userName: string): {
    primary: string;
    secondary: string;
  } {
    const index = this.hashString(userName) % colorPalettes.length;
    return colorPalettes[index];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
