class Game < ApplicationRecord
  belongs_to :user
  validates :player_avatar, presence: true
  validates :cpu1_avatar, presence: true
  validates :cpu2_avatar, presence: true
  validates :cpu3_avatar, presence: true
end
