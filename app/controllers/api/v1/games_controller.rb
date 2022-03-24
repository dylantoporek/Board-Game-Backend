class Api::V1::GamesController < ApplicationController

    # get /games
    def index
        render json: @current_user.games.all
    end

    # post /games
    def create
        game = @current_user.games.create!(game_params)
        render json: game, status: :created
    end

    # get /games/id
    def show
        game = @current_user.games.find_by(id: params[:id])
        render json: game, status: :created
    end

    # delete /games/id
    def destroy
        game = @current_user.games.find_by(id: params[:id])
        game.delete
        head :no_content
    end

    # patch /games/id
    def update
        game = @current_user.games.find_by(id: params[:id])
        game.update(
            player_position: params[:player_position],
            cpu1_position: params[:cpu1_position],
            cpu2_position: params[:cpu2_position],
            cpu3_position: params[:cpu3_position]
        )
        render json: game, status: :ok
    end

    private

    def game_params
        params.permit(:player_avatar, :player_position, :cpu1_avatar, :cpu1_position, :cpu2_avatar, :cpu2_position, :cpu3_avatar, :cpu3_position)
    end
end
