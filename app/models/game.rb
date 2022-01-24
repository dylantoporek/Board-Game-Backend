class Game < ApplicationRecord
 
  validates :player_avatar, presence: true
  validates :cpu1_avatar, presence: true
  validates :cpu2_avatar, presence: true
  validates :cpu3_avatar, presence: true
  belongs_to :user
end
